import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { it, expect } from "vitest";
it("boots the complete SQL schema and migrations with real triggers and restrictive client grants", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
      create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql as 'select null::uuid';
      create function uuid_generate_v4() returns uuid language sql as 'select gen_random_uuid()';
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key,bucket_id text,name text);
      alter table storage.objects enable row level security;`);
    await db.exec(
      readFileSync("supabase_sql_editor.sql", "utf8").replace(
        /CREATE EXTENSION IF NOT EXISTS "uuid-ossp";/gi,
        "",
      ),
    );
    for (const f of readdirSync("supabase/migrations")
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(readFileSync("supabase/migrations/" + f, "utf8"));
    const id = crypto.randomUUID();
    await db.query(
      "insert into auth.users(id,email) values($1,'qa@example.invalid')",
      [id],
    );
    expect(
      (
        await db.query<{ role: string }>(
          "select role from profiles where id=$1",
          [id],
        )
      ).rows[0].role,
    ).toBe("viewer");
    const grants = await db.query<{ can_write: boolean; can_execute: boolean }>(
      "select has_table_privilege('authenticated','products','UPDATE') can_write,has_function_privilege('anon','create_checkout(jsonb,uuid)','EXECUTE') can_execute",
    );
    expect(grants.rows[0]).toEqual({ can_write: false, can_execute: false });
    await db.query(
      "insert into products(name,slug,sku,price,stock,is_active) values('Visible product','visible','V',100,1,true),('Hidden product','hidden','H',100,1,false)",
    );
    await db.exec("set role anon");
    expect((await db.query("select name from products")).rows).toEqual([
      { name: "Visible product" },
    ]);
    await expect(
      db.query("select create_checkout('{}'::jsonb,gen_random_uuid())"),
    ).rejects.toThrow("permission denied");
    await db.exec("reset role");
    await db.query("update profiles set role='admin' where id=$1", [id]);
    await db.exec(
      `create or replace function auth.uid() returns uuid language sql as $$select '${id}'::uuid$$`,
    );
    await db.exec("set role authenticated");
    const report = (
      await db.query<{ report: { months: unknown[] } }>(
        "select get_commerce_analytics() report",
      )
    ).rows[0].report;
    expect(report.months).toHaveLength(6);
    await db.exec("reset role");
  } finally {
    await db.close();
  }
}, 20000);
