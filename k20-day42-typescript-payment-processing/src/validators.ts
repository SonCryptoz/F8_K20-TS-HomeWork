import type { PaymentMethod, PaymentRequest } from "./types";

const VALID_METHODS: readonly PaymentMethod[] = ["COD", "BANK_TRANSFER", "E_WALLET"];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
    return typeof value === "string" && VALID_METHODS.includes(value as PaymentMethod);
}

export function isPaymentRequest(value: unknown): value is PaymentRequest {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const record = value as Record<string, unknown>;
    const { orderId, amount, method } = record;

    // orderId là số nguyên dương (> 0)
    const isValidOrderId = typeof orderId === "number" && Number.isInteger(orderId) && orderId > 0;

    // amount là số hữu hạn và lớn hơn 0
    const isValidAmount = typeof amount === "number" && Number.isFinite(amount) && amount > 0;

    // method thuộc 1 trong 3 giá trị của PaymentMethod
    const isValidMethod = isPaymentMethod(method);

    return isValidOrderId && isValidAmount && isValidMethod;
}