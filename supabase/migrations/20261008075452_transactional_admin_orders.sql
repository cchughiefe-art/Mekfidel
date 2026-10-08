alter table public.statistics add column if not exists is_verified boolean not null default false;
alter table public.ai_change_requests add column if not exists provider text, add column if not exists model text, add column if not exists answer text, add column if not exists warnings jsonb not null default '[]'::jsonb;
-- Atomic checkout, guarded order transitions and recoverable admin previews.
-- SECURITY DEFINER functions have fixed search_path and service-role-only EXECUTE.
alter table public.orders add column if not exists idempotency_key uuid unique;
alter table public.orders add column if not exists request_fingerprint text;
alter table public.orders add column if not exists inventory_reserved boolean not null default false;
alter table public.order_items add column if not exists stock_reserved boolean not null default false;
create table if not exists public.request_limits (
  key text primary key, window_start timestamptz not null default now(), requests integer not null default 1
);
create index request_limits_expiry on public.request_limits(window_start);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from anon, authenticated;

create or replace function public.consume_request_limit(p_key text, p_limit int, p_seconds int)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
declare allowed boolean;
begin
  if p_limit<1 or p_seconds<1 or p_seconds>86400 then raise exception 'Invalid rate limit'; end if;
  delete from request_limits where key in (select key from request_limits where window_start<now()-interval '2 days' limit 100);
  insert into request_limits(key) values(p_key)
  on conflict(key) do update set
    requests = case when request_limits.window_start < now()-make_interval(secs=>p_seconds) then 1 else request_limits.requests+1 end,
    window_start = case when request_limits.window_start < now()-make_interval(secs=>p_seconds) then now() else request_limits.window_start end
  returning requests <= p_limit into allowed;
  return allowed;
end $$;
revoke all on function public.consume_request_limit(text,int,int) from public, anon, authenticated;
grant execute on function public.consume_request_limit(text,int,int) to service_role;

create or replace function public.guard_order_status()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.status is not distinct from old.status then return new; end if;
  if old.status in ('delivered','cancelled') then raise exception 'Completed orders cannot change status'; end if;
  if new.status <> 'cancelled' and not (
    (old.status='pending' and new.status='confirmed') or
    (old.status='confirmed' and new.status='processing') or
    (old.status='processing' and new.status='ready') or
    (old.status='ready' and new.status='delivered')
  ) then raise exception 'Move the order to the next step or cancel it'; end if;
  if new.status='cancelled' and old.inventory_reserved then
    update products p set stock=p.stock+i.quantity from
      (select product_id,sum(quantity)::int quantity from order_items where order_id=old.id and stock_reserved group by product_id) i
      where p.id=i.product_id;
    new.inventory_reserved=false;
  end if;
  return new;
end $$;
drop trigger if exists guard_order_status on public.orders;
create trigger guard_order_status before update of status on public.orders for each row execute function public.guard_order_status();

create or replace function public.sync_customer_totals()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(lower(coalesce(new.customer_email,old.customer_email)),1));
  update customers c set total_orders = (select count(*) from orders o where lower(o.customer_email)=lower(c.email) and o.status<>'cancelled'),
    total_spent = (select coalesce(sum(total),0) from orders o where lower(o.customer_email)=lower(c.email) and o.status='delivered')
    where lower(c.email)=lower(coalesce(new.customer_email,old.customer_email));
  return null;
end $$;
drop trigger if exists sync_customer_totals on public.orders;
create trigger sync_customer_totals after insert or update or delete on public.orders for each row execute function public.sync_customer_totals();

create or replace function public.create_checkout(p_body jsonb, p_key uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare existing orders; created orders; line record; product products; quantity_sum int; order_total numeric=0;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
  select * into existing from orders where idempotency_key=p_key;
  if found then
    if existing.request_fingerprint is distinct from md5(p_body::text) then raise exception 'Order reference belongs to another request'; end if;
    return jsonb_build_object('id',existing.id,'total',existing.total,'status',existing.status);
  end if;
  if jsonb_array_length(p_body->'items') not between 1 and 50 then raise exception 'Invalid cart'; end if;
  -- Lock in a deterministic order and aggregate duplicate lines before checking stock.
  for line in select (x->>'product_id')::uuid id,sum((x->>'quantity')::int)::int quantity,
      min((x->>'expected_price')::numeric) expected_price,max((x->>'expected_price')::numeric) max_price
      from jsonb_array_elements(p_body->'items') x group by (x->>'product_id')::uuid order by 1
  loop
    select * into product from products where id=line.id for update;
    if not found or product.is_active is distinct from true then raise exception 'A product is no longer available'; end if;
    if line.quantity not between 1 and 100 then raise exception 'Invalid combined quantity'; end if;
    if coalesce(product.availability,'out_of_stock') not in ('in_stock','pre_order') or (product.availability<>'pre_order' and product.stock<line.quantity) then raise exception '% does not have enough stock',product.name; end if;
    if line.expected_price is null or line.expected_price<>product.price or line.max_price<>product.price then raise exception 'Prices changed. Refresh your cart before submitting'; end if;
    order_total=order_total+product.price*line.quantity;
  end loop;
  -- Customer identity is serialized to avoid duplicate rows and lost aggregate updates.
  perform pg_advisory_xact_lock(hashtextextended(lower(p_body->>'customer_email'),1));
  if not exists(select 1 from customers where lower(email)=lower(p_body->>'customer_email')) then
    insert into customers(name,email,phone,address,state,city,total_orders,total_spent)
      values(p_body->>'customer_name',lower(p_body->>'customer_email'),p_body->>'customer_phone',p_body->>'customer_address',p_body->>'state',p_body->>'city',0,0);
  end if;
  insert into orders(customer_name,customer_email,customer_phone,customer_address,state,city,notes,total,status,idempotency_key,inventory_reserved,request_fingerprint)
    values(p_body->>'customer_name',lower(p_body->>'customer_email'),p_body->>'customer_phone',p_body->>'customer_address',p_body->>'state',p_body->>'city',p_body->>'notes',order_total,'pending',p_key,true,md5(p_body::text)) returning * into created;
  for line in select (x->>'product_id')::uuid id,sum((x->>'quantity')::int)::int quantity from jsonb_array_elements(p_body->'items') x group by 1 loop
    select * into product from products where id=line.id;
    insert into order_items(order_id,product_id,product_name,quantity,price,stock_reserved) values(created.id,product.id,product.name,line.quantity,product.price,product.availability<>'pre_order');
    if product.availability<>'pre_order' then update products set stock=stock-line.quantity where id=product.id; end if;
  end loop;
  return jsonb_build_object('id',created.id,'total',created.total,'status',created.status);
end $$;
revoke all on function public.create_checkout(jsonb,uuid) from public, anon, authenticated;
grant execute on function public.create_checkout(jsonb,uuid) to service_role;

create or replace function public.execute_admin_preview(p_request_id uuid,p_user_id uuid,p_rollback boolean default false)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare req ai_change_requests; action jsonb; resource text; operation text; target uuid;
  changes jsonb; before_row jsonb; after_row jsonb; expected jsonb; journal jsonb='[]';
  columns_sql text; values_sql text; set_sql text; allowed jsonb = '{"profiles":["full_name","role"],"media":["name","alt","folder"],"orders":["status","notes"],"customers":["name","phone","address","state","city"],"uploaded_icons":["name","slug","tags","svg_content","width","height"],"products":["name","slug","description","features","specifications","category_id","brand_id","price","compare_price","stock","sku","warranty","availability","images","is_featured","is_active","seo_title","seo_description"],"categories":["name","slug","description","image","parent_id","order","is_active"],"brands":["name","slug","logo","description","is_active"],"screen_compatibility":["brand","model","series","screen_code","manufacturer_model","compatible_with","notes","is_active"],"blog_posts":["title","slug","content","excerpt","image","category","tags","author","is_published","published_at","seo_title","seo_description"],"faqs":["question","answer","category","sort_order","is_published"],"testimonials":["name","role","company","content","rating","image","avatar","is_published","is_featured","sort_order"],"services":["title","description","icon","color","features","order_index","is_active"],"homepage_sections":["section_key","section_type","title","subtitle","description","button_text","button_url","image","background_image","icon","color","background_color","sort_order","is_active","metadata"],"feature_cards":["section_id","title","description","icon_library","icon_name","icon_color","url","sort_order","is_active"],"statistics":["context","label","value","suffix","icon_library","icon_name","sort_order","is_active","is_verified"],"navigation_items":["location","label","url","icon_library","icon_name","parent_id","sort_order","is_active","is_new_tab"],"footer_sections":["section_key","title","content","icon_library","icon_name","links","sort_order","is_active"],"social_links":["platform","label","icon_library","icon_name","url","is_visible","sort_order"],"company_info":["info_key","info_type","title","content","image","icon_library","icon_name","sort_order","is_active"],"content_blocks":["block_key","block_type","title","content","page","position","sort_order","is_active"],"settings":["company_name","logo","phone","whatsapp","email","address","business_hours","social_media","homepage_hero_title","homepage_hero_subtitle","hero_banner","about_text","footer_text","seo_title","seo_description","seo_keywords","google_maps_embed"]}'::jsonb;
begin
  if not exists(select 1 from profiles where id=p_user_id and role in ('admin','editor')) then raise exception 'Forbidden'; end if;
  select * into req from ai_change_requests where id=p_request_id and created_by=p_user_id for update;
  if not found then raise exception 'Preview not found'; end if;
  if (not p_rollback and req.status<>'pending') or (p_rollback and req.status<>'applied') then raise exception 'This preview has already been processed'; end if;
  for action in select value from jsonb_array_elements(case when p_rollback then req.rollback_actions else req.actions end) loop
    resource=action->>'resource'; operation=action->>'operation'; changes=coalesce(action->'changes','{}'::jsonb); target=(action->>'targetId')::uuid; expected=action->'expected';
    if exists(select 1 from profiles where id=p_user_id and role='editor') and resource in ('products','categories','brands','screen_compatibility','orders','customers','settings','profiles') then raise exception 'Forbidden'; end if;
    if not allowed ? resource then raise exception 'Unsupported resource'; end if;
    if resource in ('settings','orders','customers','profiles','media') and operation<>'update' then raise exception 'This resource supports updates only'; end if;
    if operation not in ('create','update','delete') then raise exception 'Unsupported operation'; end if;
    if not p_rollback and exists(select 1 from jsonb_object_keys(changes) k where not (allowed->resource) ? k) then raise exception 'Unsupported field'; end if;
    before_row=null; after_row=null;
    if operation<>'create' then
      execute format('select to_jsonb(t) from public.%I t where id=$1 for update',resource) into before_row using target;
      if before_row is null then raise exception 'Record no longer exists'; end if;
      if before_row is distinct from expected then raise exception 'Record changed since preview. Generate a new preview before continuing'; end if;
    end if;
    if operation='delete' then
      -- Block cascades: all affected records must have their own visible preview.
      if resource='products' and exists(select 1 from order_items where product_id=target) then raise exception 'Product has order history. Archive it instead'; end if;
      if resource='categories' and (exists(select 1 from products where category_id=target) or exists(select 1 from categories where parent_id=target)) then raise exception 'Category still has products or children'; end if;
      if resource='brands' and exists(select 1 from products where brand_id=target) then raise exception 'Brand still has products'; end if;
      if resource='homepage_sections' and exists(select 1 from feature_cards where section_id=target) then raise exception 'Section still has feature cards'; end if;
      if resource='navigation_items' and exists(select 1 from navigation_items where parent_id=target) then raise exception 'Navigation item still has children'; end if;
      execute format('delete from public.%I where id=$1',resource) using target;
      -- Undo inserts can restore the ID plus approved fields, preserving timestamps via their defaults.
      journal=jsonb_build_array(jsonb_build_object('operation','create','resource',resource,'targetId',target,'changes',before_row,'expected',null))||journal;
    elsif operation='create' then
      target=coalesce(target,gen_random_uuid()); changes=changes||jsonb_build_object('id',target);
      select string_agg(format('%I',key),',' order by key),string_agg(format('r.%I',key),',' order by key) into columns_sql,values_sql from jsonb_object_keys(changes) key;
      execute format('insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I,$1) r returning to_jsonb(%I.*)',resource,columns_sql,values_sql,resource,resource) into after_row using changes;
      journal=jsonb_build_array(jsonb_build_object('operation','delete','resource',resource,'targetId',target,'changes','{}'::jsonb,'expected',after_row))||journal;
    else
      select string_agg(format('%I=r.%I',key,key),',' order by key) into set_sql from jsonb_object_keys(changes) key;
      if set_sql is null then raise exception 'No changes supplied'; end if;
      execute format('update public.%I t set %s from jsonb_populate_record(null::public.%I,$1) r where t.id=$2 returning to_jsonb(t)',resource,set_sql,resource) into after_row using changes,target;
      journal=jsonb_build_array(jsonb_build_object('operation','update','resource',resource,'targetId',target,'changes',(select jsonb_object_agg(key,before_row->key) from jsonb_object_keys(changes) key),'expected',after_row))||journal;
    end if;
  end loop;
  -- Data changes and the undo journal commit together. Any exception rolls back everything.
  update ai_change_requests set status=case when p_rollback then 'rolled_back' else 'applied' end,
    rollback_actions=case when p_rollback then rollback_actions else journal end,
    applied_at=case when p_rollback then applied_at else now() end,
    rolled_back_at=case when p_rollback then now() else null end,error=null where id=req.id;
  return jsonb_build_object('id',req.id,'status',case when p_rollback then 'rolled_back' else 'applied' end);
end $$;
revoke all on function public.execute_admin_preview(uuid,uuid,boolean) from public, anon, authenticated;
grant execute on function public.execute_admin_preview(uuid,uuid,boolean) to service_role;

create table if not exists public.newsletter_subscribers (id uuid primary key default gen_random_uuid(), email text unique not null, consented_at timestamptz not null default now(), created_at timestamptz not null default now());
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon,authenticated;
grant all on public.newsletter_subscribers to service_role;

-- Prevent accidental lockout even when two administrators change roles concurrently.
create or replace function public.guard_last_admin() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if old.role='admin' and new.role is distinct from 'admin' then
  perform pg_advisory_xact_lock(761947);
  if (select count(*) from profiles where role='admin')<=1 then raise exception 'Keep at least one administrator'; end if;
 end if;
 return new;
end $$;
drop trigger if exists guard_last_admin on public.profiles;
create trigger guard_last_admin before update of role on public.profiles for each row execute function public.guard_last_admin();
-- Browser credentials cannot bypass the checkout engine or edit calculated totals.
revoke insert,delete,update on public.orders from anon,authenticated;
-- Order status updates also use the audited server engine.
revoke insert,update,delete on public.order_items from anon,authenticated;
revoke insert,update,delete on public.profiles from anon,authenticated;

create or replace function public.is_project_admin() returns boolean language sql stable security definer set search_path=public,pg_temp as $$select exists(select 1 from public.profiles where id=auth.uid() and role='admin')$$;
revoke all on function public.is_project_admin() from public;
grant execute on function public.is_project_admin() to anon,authenticated,service_role;
do $$declare policy record;begin
 for policy in select schemaname,tablename,policyname from pg_policies where schemaname='public' and tablename in ('orders','order_items','customers','profiles','settings') loop
  execute format('drop policy %I on public.%I',policy.policyname,policy.tablename);
 end loop;
end $$;
create policy "Admin orders" on public.orders for all to authenticated using(is_project_admin()) with check(is_project_admin());
create policy "Admin order items" on public.order_items for select to authenticated using(is_project_admin());
create policy "Admin customers" on public.customers for all to authenticated using(is_project_admin()) with check(is_project_admin());
create policy "Read own profile" on public.profiles for select to authenticated using(id=auth.uid());
create policy "Admin profiles" on public.profiles for select to authenticated using(is_project_admin());
create policy "Public settings" on public.settings for select to anon,authenticated using(true);
create policy "Admin settings" on public.settings for all to authenticated using(is_project_admin()) with check(is_project_admin());
alter table public.products add constraint products_valid_stock check(stock>=0) not valid;
alter table public.products add constraint products_valid_price check(price>=0 and (compare_price is null or compare_price>=0)) not valid;
alter table public.order_items add constraint order_items_valid_quantity check(quantity between 1 and 100 and price>=0) not valid;

-- Repair aggregate values left behind by cancelled/deleted test orders.
update public.customers c set total_orders=(select count(*) from public.orders o where lower(o.customer_email)=lower(c.email) and o.status<>'cancelled'),total_spent=(select coalesce(sum(total),0) from public.orders o where lower(o.customer_email)=lower(c.email) and o.status='delivered');

create or replace function public.increment_product_views(product_id uuid) returns void language sql security definer set search_path=public,pg_temp as $$update public.products set views=coalesce(views,0)+1 where id=product_id and is_active$$;
create or replace function public.increment_blog_views(post_id uuid) returns void language sql security definer set search_path=public,pg_temp as $$update public.blog_posts set views=coalesce(views,0)+1 where id=post_id and is_published$$;
revoke all on function public.increment_product_views(uuid),public.increment_blog_views(uuid) from public;
grant execute on function public.increment_product_views(uuid),public.increment_blog_views(uuid) to anon,authenticated;


-- All content changes pass through the server engine, which validates role, fields and journal.
do $$declare table_name text;begin
 foreach table_name in array array['products','categories','brands','screen_compatibility','blog_posts','faqs','testimonials','settings','services','media','homepage_sections','feature_cards','statistics','navigation_items','footer_sections','social_links','company_info','content_blocks','uploaded_icons','customers'] loop
  execute format('revoke insert,update,delete on public.%I from anon,authenticated',table_name);
 end loop;
end $$;
-- Public buckets are read-only to browser credentials. Server uploads validate file signatures.
do $$begin
 if to_regclass('storage.objects') is not null then
  execute 'create policy "Mekfidel website file reads" on storage.objects for select to anon,authenticated using (bucket_id in (''logos'',''products'',''banners'',''gallery'',''blog'',''icons'',''uploads''))';
  execute 'create policy "Mekfidel server uploads" on storage.objects as restrictive for insert to anon,authenticated with check (bucket_id not in (''logos'',''products'',''banners'',''gallery'',''blog'',''icons'',''uploads''))';
  execute 'create policy "Mekfidel server file updates" on storage.objects as restrictive for update to anon,authenticated using (bucket_id not in (''logos'',''products'',''banners'',''gallery'',''blog'',''icons'',''uploads'')) with check (bucket_id not in (''logos'',''products'',''banners'',''gallery'',''blog'',''icons'',''uploads''))';
  execute 'create policy "Mekfidel server file deletion" on storage.objects as restrictive for delete to anon,authenticated using (bucket_id not in (''logos'',''products'',''banners'',''gallery'',''blog'',''icons'',''uploads''))';
 end if;
end $$;

-- Replace the clearly unfinished test service with accurate supply information.
update public.services set title='Repair tools and parts supply', description='Phone repair tools, replacement screens and spare parts. Contact the shop to confirm compatibility and availability.', features=array['Repair tools','Replacement screens','Spare parts']::text[] where trim(title)='Phone repair service' and description='Jj' and features=array['Gg']::text[];

-- Keep the unfinished catalogue test item for admins, but remove it from public sale.
update public.products set is_active=false where name='Rctvtv' and slug='rctvtv' and sku='Gg' and category_id is null and coalesce(cardinality(images),0)=0;


-- Calculate totals in PostgreSQL so they do not depend on the API row limit.
create or replace function public.get_admin_statistics() returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
begin
 if not public.is_project_admin() then raise exception 'Forbidden'; end if;
 return jsonb_build_object('totalRevenue',(select coalesce(sum(total),0) from orders where status='delivered'),'totalOrders',(select count(*) from orders),'products',(select count(*) from products),'deliveredOrders',(select count(*) from orders where status='delivered'),'pendingOrders',(select count(*) from orders where status='pending'));
end $$;
revoke all on function public.get_admin_statistics() from public,anon;
grant execute on function public.get_admin_statistics() to authenticated;


-- Trigger functions are internal and do not need RPC access. Fix legacy mutable search paths.
do $$declare function_name text;begin
 foreach function_name in array array['update_updated_at','handle_new_user'] loop
  if to_regprocedure('public.'||function_name||'()') is not null then
   execute format('alter function public.%I() set search_path=public,pg_temp',function_name);
   execute format('revoke all on function public.%I() from public,anon,authenticated',function_name);
  end if;
 end loop;
 if to_regprocedure('public.rls_auto_enable()') is not null then
  execute 'revoke all on function public.rls_auto_enable() from public,anon,authenticated';
 end if;
end $$;
