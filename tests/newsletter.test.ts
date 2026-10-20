import { it, expect, vi, beforeEach } from "vitest";
const { rpc, upsert } = vi.hoisted(() => ({ rpc: vi.fn(), upsert: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleClient: () => ({ rpc, from: () => ({ upsert }) }),
}));
import { POST } from "@/app/api/newsletter/route";
beforeEach(() => {
  rpc.mockReset();
  upsert.mockReset();
  upsert.mockResolvedValue({ error: null });
});
it("applies the same source limit even when the email changes", async () => {
  rpc.mockResolvedValue({ data: true, error: null });
  for (const email of ["one@example.invalid", "two@example.invalid"]) {
    const res = await POST(
      new Request("https://example.invalid/api/newsletter", {
        method: "POST",
        headers: { "x-vercel-forwarded-for": "192.0.2.1" },
        body: JSON.stringify({ email, consent: true }),
      }),
    );
    expect(res.status).toBe(200);
  }
  expect(rpc.mock.calls[1][1].p_key).toBe(rpc.mock.calls[4][1].p_key);
  expect(rpc.mock.calls[0][1].p_key).toBe("newsletter:global");
});
it("does not write a subscription when the source budget is exhausted", async () => {
  rpc
    .mockResolvedValueOnce({ data: true, error: null })
    .mockResolvedValueOnce({ data: false, error: null });
  const res = await POST(
    new Request("https://example.invalid/api/newsletter", {
      method: "POST",
      body: JSON.stringify({ email: "one@example.invalid", consent: true }),
    }),
  );
  expect(res.status).toBe(429);
  expect(upsert).not.toHaveBeenCalled();
});
