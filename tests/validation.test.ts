import { it, expect } from "vitest";
import { safeUrl, googleMapsUrl, searchTerm } from "@/lib/utils/safe-content";
import { validateChanges } from "@/lib/ai-cms/resources";
import { createOrderSchema } from "@/lib/utils/validators";
it("rejects active URLs and limits embed hosts", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.example",
    "https:\\evil.example",
    "https://example.com/a b",
  ])
    expect(safeUrl(value, "")).toBe("");
  expect(safeUrl("/products")).toBe("/products");
  expect(safeUrl("https://example.com")).toBe("https://example.com");
  expect(
    googleMapsUrl('<iframe src="https://evil.example/maps/embed"></iframe>'),
  ).toBeNull();
  expect(
    googleMapsUrl(
      '<iframe src="https://www.google.com/maps/embed?pb=test"></iframe>',
    ),
  ).toContain("google.com/maps/embed");
});
it("normalizes AI values but rejects forbidden fields and malformed types", () => {
  expect(
    validateChanges("products", {
      stock: "12",
      is_active: "false",
      features: "One,Two",
    }),
  ).toEqual({ stock: 12, is_active: false, features: ["One", "Two"] });
  for (const changes of [
    { stock: -1 },
    { stock: 1.2 },
    { stock: null },
    { price: "not a number" },
    { images: ["javascript:alert(1)"] },
    { specifications: [] },
    { id: crypto.randomUUID() },
  ])
    expect(() => validateChanges("products", changes)).toThrow();
  expect(() => validateChanges("profiles", { role: "owner" })).toThrow();
});
it("does not accept checkout without explicit prices and validates customer details", () => {
  expect(
    createOrderSchema.safeParse({
      items: [{ product_id: crypto.randomUUID(), quantity: 1 }],
    }).success,
  ).toBe(false);
  expect(searchTerm("a,b.(c)%_*")).toBe("a b  c");
});

import { sanitizeSvg } from "@/lib/utils/safe-svg";
it("removes SVG scripts, handlers, foreign content and external references", () => {
  const result = sanitizeSvg(
    '<svg xmlns="http://www.w3.org/2000/svg" onload="bad()"><script>bad()</script><foreignObject><iframe src="https://example.com"></iframe></foreignObject><use href="https://example.com/a.svg#x"/><path d="M0 0" fill="url(https://example.com/a)"/></svg>',
  );
  expect(result).not.toMatch(/script|onload|iframe|foreignObject|example\.com/);
  expect(result).toContain("<path");
  expect(() => sanitizeSvg("<!DOCTYPE svg><svg/>")).toThrow();
});
