import { afterEach, it, expect, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
const { generate } = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock("ai", () => ({
  generateText: generate,
  Output: { object: () => ({}) },
}));
vi.mock("@ai-sdk/groq", () => ({
  createGroq: () => (id: string) => ({ provider: "groq", id }),
}));
vi.mock("@ai-sdk/google", () => ({
  createGoogle: () => (id: string) => ({ provider: "gemini", id }),
}));
import { createAiPlan } from "@/lib/ai-cms/server";
const query = {
  select() {
    return this;
  },
  order() {
    return this;
  },
  or() {
    return this;
  },
  limit: async () => ({ data: [], count: 0, error: null }),
};
const db = { from: () => query } as unknown as SupabaseClient;
const answer = {
  output: {
    summary: "Nothing changed",
    answer: "Please select a product.",
    warnings: [],
    actions: [],
  },
};
afterEach(() => {
  vi.unstubAllEnvs();
  generate.mockReset();
  vi.restoreAllMocks();
});
it("falls back to Gemini after Groq reaches its quota", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-only");
  vi.stubEnv("GEMINI_API_KEY", "test-only");
  vi.spyOn(console, "error").mockImplementation(() => {});
  generate
    .mockRejectedValueOnce({ statusCode: 429 })
    .mockResolvedValueOnce(answer);
  const plan = await createAiPlan(db, "Find a product");
  expect(plan.provider).toBe("gemini");
  expect(generate).toHaveBeenCalledTimes(2);
  expect(plan.actions).toEqual([]);
});
it("does not silently switch when an administrator explicitly selects Groq", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-only");
  vi.stubEnv("GEMINI_API_KEY", "test-only");
  vi.spyOn(console, "error").mockImplementation(() => {});
  generate.mockRejectedValueOnce({
    statusCode: 429,
    responseBody: "private provider response",
  });
  await expect(createAiPlan(db, "Find a product", "groq")).rejects.toThrow(
    "free-tier limit reached",
  );
  expect(generate).toHaveBeenCalledTimes(1);
});
it("leaves manual controls available when no provider is configured", async () => {
  vi.stubEnv("GROQ_API_KEY", "");
  vi.stubEnv("GEMINI_API_KEY", "");
  await expect(createAiPlan(db, "Find a product")).rejects.toThrow(
    "manual controls remain available",
  );
  expect(generate).not.toHaveBeenCalled();
});
it("rejects an AI product that bypasses required catalogue fields", async () => {
  vi.stubEnv("GROQ_API_KEY", "test-only");
  vi.stubEnv("GEMINI_API_KEY", "");
  vi.spyOn(console, "error").mockImplementation(() => {});
  generate.mockResolvedValueOnce({
    output: {
      ...answer.output,
      actions: [
        {
          operation: "create",
          resource: "products",
          targetId: null,
          targetLabel: "Incomplete",
          changesJson: JSON.stringify({ name: "Incomplete", price: 100 }),
        },
      ],
    },
  });
  await expect(createAiPlan(db, "Create a product", "groq")).rejects.toThrow(
    "valid preview",
  );
});
