import { it, expect } from "vitest";
import {
  persistCheckout,
  readPendingCheckout,
} from "@/lib/utils/pending-checkout";
import { readJson, BodyTooLargeError } from "@/lib/utils/request-body";
const body = {
  customer_name: "Test Customer",
  customer_email: "test@example.invalid",
  customer_phone: "08000000000",
  customer_address: "Test address",
  state: "Lagos",
  city: "Lagos",
  items: [
    {
      product_id: "10000000-0000-4000-8000-000000000001",
      quantity: 1,
      expected_price: 1000,
    },
  ],
};
it("restores the exact submission and key after a reload", () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: (key: string) => data.get(key) || null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
  const first = persistCheckout(storage, body);
  expect(readPendingCheckout(storage)).toEqual(first);
  expect(readPendingCheckout(storage)?.key).toBe(first.key);
});
it("does not create a sendable submission when persistence fails", () => {
  expect(() =>
    persistCheckout(
      {
        setItem: () => {
          throw new Error("Storage unavailable");
        },
      },
      body,
    ),
  ).toThrow("Storage unavailable");
});
it("rejects malformed saved submissions", () => {
  expect(() =>
    readPendingCheckout({ getItem: () => '{"key":"bad","body":{}}' }),
  ).toThrow();
});
it("bounds streamed bodies even without Content-Length", async () => {
  const request = new Request("https://example.invalid", {
    method: "POST",
    body: JSON.stringify({ name: "a".repeat(200) }),
  });
  await expect(readJson(request, 100)).rejects.toBeInstanceOf(
    BodyTooLargeError,
  );
});
it("accepts bounded valid JSON", async () => {
  await expect(
    readJson(
      new Request("https://example.invalid", {
        method: "POST",
        body: '{"ok":true}',
      }),
      100,
    ),
  ).resolves.toEqual({ ok: true });
});
