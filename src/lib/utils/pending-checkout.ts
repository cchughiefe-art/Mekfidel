import { z } from "zod";
import { createOrderSchema } from "./validators";
export const PENDING_CHECKOUT_KEY = "mekfidel-pending-checkout-v1";
const pendingSchema = z.object({
  key: z.string().uuid(),
  body: createOrderSchema,
});
export type PendingCheckout = z.infer<typeof pendingSchema>;
export function readPendingCheckout(
  storage: Pick<Storage, "getItem">,
): PendingCheckout | null {
  const raw = storage.getItem(PENDING_CHECKOUT_KEY);
  return raw ? pendingSchema.parse(JSON.parse(raw)) : null;
}
export function persistCheckout(
  storage: Pick<Storage, "setItem">,
  body: z.infer<typeof createOrderSchema>,
): PendingCheckout {
  const pending = pendingSchema.parse({ key: crypto.randomUUID(), body });
  storage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
  return pending;
}
