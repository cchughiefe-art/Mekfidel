-- Manual-confirmation inventory and content-aware optimistic concurrency.
-- Existing reserved orders retain their reservation until cancelled or fulfilled.
create or replace function public.cms_editable_snapshot(resource text, snapshot jsonb)
returns jsonb language sql immutable set search_path=public,pg_temp as $$
  select case when resource in ('products','blog_posts')
    then snapshot - 'views' - 'updated_at' else snapshot end
$$;
revoke all on function public.cms_editable_snapshot(text,jsonb) from public,anon,authenticated;
create or replace function public.guard_order_status()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare line record; product products;
begin
  if new.status is not distinct from old.status then return new; end if;
  if old.status in ('delivered','cancelled') then raise exception 'Completed orders cannot change status'; end if;
  if new.status <> 'cancelled' and not (
    (old.status='pending' and new.status='confirmed') or
    (old.status='confirmed' and new.status='processing') or
    (old.status='processing' and new.status='ready') or
    (old.status='ready' and new.status='delivered')
  ) then raise exception 'Move the order to the next step or cancel it'; end if;
  -- Requests do not hold stock; staff confirmation makes the reservation atomically.
  if old.status='pending' and new.status='confirmed' and not old.inventory_reserved then
    for line in select product_id,sum(quantity)::int quantity from order_items
      where order_id=old.id group by product_id order by product_id loop
      select * into product from products where id=line.product_id for update;
      if not found or product.is_active is distinct from true
         or coalesce(product.availability,'out_of_stock') not in ('in_stock','pre_order') then
        raise exception 'A product is no longer available';
      end if;
      if product.availability <> 'pre_order' then
        if product.stock < line.quantity then raise exception '% does not have enough stock',product.name; end if;
        update products set stock=stock-line.quantity where id=product.id;
        update order_items set stock_reserved=true where order_id=old.id and product_id=product.id;
      end if;
    end loop;
    new.inventory_reserved=true;
  end if;
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
    values(p_body->>'customer_name',lower(p_body->>'customer_email'),p_body->>'customer_phone',p_body->>'customer_address',p_body->>'state',p_body->>'city',p_body->>'notes',order_total,'pending',p_key,false,md5(p_body::text)) returning * into created;
  for line in select (x->>'product_id')::uuid id,sum((x->>'quantity')::int)::int quantity from jsonb_array_elements(p_body->'items') x group by 1 loop
    select * into product from products where id=line.id;
    insert into order_items(order_id,product_id,product_name,quantity,price,stock_reserved) values(created.id,product.id,product.name,line.quantity,product.price,false);

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
      if public.cms_editable_snapshot(resource,before_row) is distinct from public.cms_editable_snapshot(resource,expected) then raise exception 'Record changed since preview. Generate a new preview before continuing'; end if;
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


-- Aggregations run in PostgreSQL, independent of the REST row limit.
create or replace function public.get_commerce_analytics()
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp set timezone='UTC' as $$
begin
  if not public.is_project_admin() then raise exception 'Forbidden'; end if;
  return jsonb_build_object(
    'summary', public.get_admin_statistics(),
    'statuses', (select coalesce(jsonb_agg(row_to_json(s)), '[]'::jsonb) from
      (select status,count(*)::int count from orders group by status order by status) s),
    'months', (select coalesce(jsonb_agg(row_to_json(m) order by m."month"), '[]'::jsonb) from
      (select to_char(series.month_start,'YYYY-MM') as "month",
        coalesce(sum(o.total) filter(where o.status='delivered'),0) revenue,
        count(o.id)::int requests
       from generate_series(date_trunc('month',now())-interval '5 months',date_trunc('month',now()), interval '1 month') series(month_start)
       left join orders o on o.created_at>=series.month_start and o.created_at<series.month_start+interval '1 month'
       group by series.month_start) m)
  );
end $$;
revoke all on function public.get_commerce_analytics() from public,anon;
grant execute on function public.get_commerce_analytics() to authenticated;

-- Public policies must not evaluate an authenticated-only admin predicate.
-- Scope the admin policies themselves, without granting anonymous admin helpers.
do $$declare p record;begin
  for p in select tablename,policyname from pg_policies
    where schemaname='public' and policyname ilike 'Admin full%' loop
    execute format('alter policy %I on public.%I to authenticated',p.policyname,p.tablename);
  end loop;
end $$;
