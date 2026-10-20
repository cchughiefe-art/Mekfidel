import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeEach, afterEach, it, expect } from "vitest";
let db: PGlite;
const id = "10000000-0000-4000-8000-000000000001",
  user = "10000000-0000-4000-8000-000000000002";
const body = (quantity = 1) => ({
  customer_name: "Test Customer",
  customer_email: "test@example.invalid",
  customer_phone: "+2340000000000",
  customer_address: "Testing only",
  state: "Lagos",
  city: "Lagos",
  items: [{ product_id: id, quantity, expected_price: 1000 }],
});
beforeEach(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql as 'select null::uuid'; create function uuid_generate_v4() returns uuid language sql as 'select gen_random_uuid()';`,
  );
  for (const file of [
    "database.sql",
    "sql/cms_migration.sql",
    "sql/ai_cms_assistant.sql",
  ]) {
    const sql = readFileSync(file, "utf8");
    const tables =
      sql.match(/CREATE TABLE IF NOT EXISTS [\s\S]*?\n\);/gi) || [];
    for (const table of tables) await db.exec(table);
  }
  for (const file of readdirSync("supabase/migrations")
    .filter((file) => file.endsWith(".sql"))
    .sort()) {
    await db.exec(readFileSync("supabase/migrations/" + file, "utf8"));
  }
  await db.query(
    `insert into products(id,name,slug,sku,price,stock,is_active,availability) values($1,'Test','test','TEST',1000,2,true,'in_stock')`,
    [id],
  );
  await db.query("insert into auth.users(id) values($1)", [user]);
  await db.query(`insert into profiles(id,role) values($1,'admin')`, [user]);
});
afterEach(async () => {
  await db.close();
});
const checkout = async (payload = body(), key = crypto.randomUUID()) =>
  (
    await db.query<{ result: { id: string; total: number } }>(
      "select create_checkout($1::jsonb,$2::uuid) result",
      [JSON.stringify(payload), key],
    )
  ).rows[0].result;
it("does not reserve pending requests and only counts delivered sales", async () => {
  const key = crypto.randomUUID();
  const order = await checkout(body(), key);
  expect((await checkout(body(), key)).id).toBe(order.id);
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(2);
  expect(
    (
      await db.query<{ total_spent: string }>(
        "select total_spent from customers",
      )
    ).rows[0].total_spent,
  ).toBe("0.00");
  for (const status of ["confirmed", "processing", "ready", "delivered"])
    await db.query("update orders set status=$1 where id=$2", [
      status,
      order.id,
    ]);
  expect(
    Number(
      (
        await db.query<{ total_spent: string }>(
          "select total_spent from customers",
        )
      ).rows[0].total_spent,
    ),
  ).toBe(1000);
});
it("aggregates duplicate lines and atomically rejects overselling", async () => {
  const payload = body(2);
  payload.items.push({ ...payload.items[0], quantity: 1 });
  await expect(checkout(payload)).rejects.toThrow("stock");
  expect((await db.query("select * from orders")).rows).toHaveLength(0);
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(2);
});
it("returns stock on cancellation once and rejects terminal transitions", async () => {
  const order = await checkout();
  await db.query(`update orders set status='confirmed' where id=$1`, [
    order.id,
  ]);
  await db.query(`update orders set status='cancelled' where id=$1`, [
    order.id,
  ]);
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(2);
  await expect(
    db.query(`update orders set status='delivered' where id=$1`, [order.id]),
  ).rejects.toThrow("Completed orders");
});
it("rejects changed prices without creating records", async () => {
  const payload = body();
  payload.items[0].expected_price = 999;
  await expect(checkout(payload)).rejects.toThrow("Prices changed");
  expect((await db.query("select * from orders")).rows).toHaveLength(0);
});
it("applies previews and undo journals atomically and detects stale changes", async () => {
  const before = (
    await db.query<{ value: Record<string, unknown> }>(
      "select to_jsonb(p) value from products p",
    )
  ).rows[0].value;
  const request = crypto.randomUUID();
  const action = {
    operation: "update",
    resource: "products",
    targetId: id,
    targetLabel: "Test",
    changes: { price: 1500 },
    expected: before,
  };
  await db.query(
    `insert into ai_change_requests(id,created_by,instruction,summary,actions) values($1,$2,'Change price','Price update',$3)`,
    [request, user, JSON.stringify([action])],
  );
  await db.query("select execute_admin_preview($1,$2,false)", [request, user]);
  expect(
    (
      await db.query<{ status: string }>(
        "select status from ai_change_requests",
      )
    ).rows[0].status,
  ).toBe("applied");
  await db.query("select execute_admin_preview($1,$2,true)", [request, user]);
  expect(
    Number(
      (await db.query<{ price: string }>("select price from products")).rows[0]
        .price,
    ),
  ).toBe(1000);
});
it("rolls back every action when any action fails", async () => {
  const before = (
    await db.query<{ value: Record<string, unknown> }>(
      "select to_jsonb(p) value from products p",
    )
  ).rows[0].value;
  const request = crypto.randomUUID();
  const actions = [
    {
      operation: "update",
      resource: "products",
      targetId: id,
      changes: { price: 1500 },
      expected: before,
    },
    {
      operation: "update",
      resource: "settings",
      targetId: crypto.randomUUID(),
      changes: { company_name: "Changed" },
      expected: {},
    },
  ];
  await db.query(
    `insert into ai_change_requests(id,created_by,instruction,summary,actions) values($1,$2,'Change content','Update',$3)`,
    [request, user, JSON.stringify(actions)],
  );
  await expect(
    db.query("select execute_admin_preview($1,$2,false)", [request, user]),
  ).rejects.toThrow("Record no longer exists");
  expect(
    Number(
      (await db.query<{ price: string }>("select price from products")).rows[0]
        .price,
    ),
  ).toBe(1000);
  expect(
    (
      await db.query<{ status: string }>(
        "select status from ai_change_requests",
      )
    ).rows[0].status,
  ).toBe("pending");
});

it("rejects undo after a record changes and leaves the journal intact", async () => {
  const before = (
    await db.query<{ value: Record<string, unknown> }>(
      "select to_jsonb(p) value from products p",
    )
  ).rows[0].value;
  const request = crypto.randomUUID();
  await db.query(
    `insert into ai_change_requests(id,created_by,instruction,summary,actions) values($1,$2,'Update price','Price',$3)`,
    [
      request,
      user,
      JSON.stringify([
        {
          operation: "update",
          resource: "products",
          targetId: id,
          changes: { price: 1500 },
          expected: before,
        },
      ]),
    ],
  );
  await db.query("select execute_admin_preview($1,$2,false)", [request, user]);
  await db.query("update products set stock=1");
  await expect(
    db.query("select execute_admin_preview($1,$2,true)", [request, user]),
  ).rejects.toThrow("Record changed");
  expect(
    (
      await db.query<{ status: string }>(
        "select status from ai_change_requests",
      )
    ).rows[0].status,
  ).toBe("applied");
});
it("preserves deleted records including timestamps when undoing", async () => {
  const category = crypto.randomUUID();
  await db.query(
    `insert into categories(id,name,slug) values($1,'Original','original')`,
    [category],
  );
  const before = (
    await db.query<{ value: Record<string, unknown> }>(
      "select to_jsonb(c) value from categories c",
    )
  ).rows[0].value;
  const request = crypto.randomUUID();
  await db.query(
    `insert into ai_change_requests(id,created_by,instruction,summary,actions) values($1,$2,'Delete category','Delete',$3)`,
    [
      request,
      user,
      JSON.stringify([
        {
          operation: "delete",
          resource: "categories",
          targetId: category,
          changes: {},
          expected: before,
        },
      ]),
    ],
  );
  await db.query("select execute_admin_preview($1,$2,false)", [request, user]);
  await db.query("select execute_admin_preview($1,$2,true)", [request, user]);
  expect(
    (
      await db.query<{ value: Record<string, unknown> }>(
        "select to_jsonb(c) value from categories c",
      )
    ).rows[0].value,
  ).toEqual(before);
});
it("protects the last administrator and rejects editors running privileged actions", async () => {
  await expect(
    db.query(`update profiles set role='viewer' where id=$1`, [user]),
  ).rejects.toThrow("Keep at least one administrator");
  const editor = crypto.randomUUID();
  await db.query("insert into auth.users(id) values($1)", [editor]);
  await db.query(`insert into profiles(id,role) values($1,'editor')`, [editor]);
  const request = crypto.randomUUID();
  await db.query(
    `insert into ai_change_requests(id,created_by,instruction,summary,actions) values($1,$2,'Change commerce','Commerce',$3)`,
    [
      request,
      editor,
      JSON.stringify([
        {
          operation: "create",
          resource: "products",
          changes: { name: "Forbidden", slug: "forbidden", sku: "F", price: 1 },
          targetLabel: "Forbidden",
        },
      ]),
    ],
  );
  await expect(
    db.query("select execute_admin_preview($1,$2,false)", [request, editor]),
  ).rejects.toThrow("Forbidden");
});
it("does not create phantom stock when cancelling pre-orders", async () => {
  await db.query(`update products set availability='pre_order',stock=0`);
  const order = await checkout();
  await db.query(`update orders set status='confirmed' where id=$1`, [
    order.id,
  ]);
  await db.query(`update orders set status='cancelled' where id=$1`, [
    order.id,
  ]);
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(0);
});

it("reserves only on confirmation and rejects competing confirmations atomically", async () => {
  const first = await checkout(body(2));
  const second = await checkout(body(2));
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(2);
  await db.query("update orders set status='confirmed' where id=$1", [
    first.id,
  ]);
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(0);
  await expect(
    db.query("update orders set status='confirmed' where id=$1", [second.id]),
  ).rejects.toThrow("stock");
  expect(
    (
      await db.query<{ status: string }>(
        "select status from orders where id=$1",
        [second.id],
      )
    ).rows[0].status,
  ).toBe("pending");
});
it("rejects a stale form snapshot after an order reserves inventory", async () => {
  const original = (
    await db.query<{ value: Record<string, unknown> }>(
      "select to_jsonb(p) value from products p",
    )
  ).rows[0].value;
  const order = await checkout();
  await db.query("update orders set status='confirmed' where id=$1", [
    order.id,
  ]);
  const request = crypto.randomUUID();
  await db.query(
    "insert into ai_change_requests(id,created_by,instruction,summary,actions) values($1,$2,'Edit name','Edit',$3)",
    [
      request,
      user,
      JSON.stringify([
        {
          operation: "update",
          resource: "products",
          targetId: id,
          changes: { name: "New name", stock: 2 },
          expected: original,
        },
      ]),
    ],
  );
  await expect(
    db.query("select execute_admin_preview($1,$2,false)", [request, user]),
  ).rejects.toThrow("Record changed");
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(1);
});
it("allows preview apply and undo after analytics-only changes", async () => {
  const original = (
    await db.query<{ value: Record<string, unknown> }>(
      "select to_jsonb(p) value from products p",
    )
  ).rows[0].value;
  const request = crypto.randomUUID();
  await db.query(
    "insert into ai_change_requests(id,created_by,instruction,summary,actions) values($1,$2,'Edit price','Edit',$3)",
    [
      request,
      user,
      JSON.stringify([
        {
          operation: "update",
          resource: "products",
          targetId: id,
          changes: { price: 1200 },
          expected: original,
        },
      ]),
    ],
  );
  await db.query("select increment_product_views($1)", [id]);
  await db.query("select execute_admin_preview($1,$2,false)", [request, user]);
  await db.query("select increment_product_views($1)", [id]);
  await db.query("select execute_admin_preview($1,$2,true)", [request, user]);
  const row = (
    await db.query<{ price: string; views: number }>(
      "select price,views from products",
    )
  ).rows[0];
  expect(Number(row.price)).toBe(1000);
  expect(row.views).toBe(2);
});
it("keeps existing legacy reservations when confirming without double-decrementing", async () => {
  const order = await checkout();
  await db.query("update orders set inventory_reserved=true where id=$1", [
    order.id,
  ]);
  await db.query(
    "update order_items set stock_reserved=true where order_id=$1",
    [order.id],
  );
  await db.query("update products set stock=1 where id=$1", [id]);
  await db.query("update orders set status='confirmed' where id=$1", [
    order.id,
  ]);
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(1);
  await db.query("update orders set status='cancelled' where id=$1", [
    order.id,
  ]);
  expect(
    (await db.query<{ stock: number }>("select stock from products")).rows[0]
      .stock,
  ).toBe(2);
});
