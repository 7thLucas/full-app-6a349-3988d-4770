import crypto from "node:crypto";

// Payment gateway seam (SRP/DIP). Consumers depend on PaymentGateway, not a
// concrete provider — admin/finance (Sprint 17) can swap providers without
// touching checkout. charge() is idempotent: same key returns the same result.

export interface ChargeRequest {
  idempotencyKey: string;
  amount: number;
  method: string;
  orderRef: string;
}

export interface ChargeResult {
  status: "paid" | "authorized" | "failed";
  gatewayRef: string;
}

export interface PaymentGateway {
  charge(req: ChargeRequest): Promise<ChargeResult>;
  refund(gatewayRef: string, amount: number): Promise<{ status: "refunded"; gatewayRef: string }>;
}

// Simulated gateway (QRIS-first). Deterministic per idempotency key so retries
// never produce a second authorization. A magic amount lets tests force failure.
class SimulatedGateway implements PaymentGateway {
  private readonly seen = new Map<string, ChargeResult>();

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    const cached = this.seen.get(req.idempotencyKey);
    if (cached) return cached;

    // Test hook: any amount ending in 13 (e.g. 13, 1013) simulates a decline.
    const declined = req.amount > 0 && req.amount % 100 === 13;
    const result: ChargeResult = declined
      ? { status: "failed", gatewayRef: "GW-DECLINED-" + crypto.randomBytes(4).toString("hex") }
      : { status: "paid", gatewayRef: "GW-" + crypto.randomBytes(6).toString("hex").toUpperCase() };

    this.seen.set(req.idempotencyKey, result);
    return result;
  }

  async refund(gatewayRef: string) {
    return { status: "refunded" as const, gatewayRef };
  }
}

export const paymentGateway: PaymentGateway = new SimulatedGateway();
