import type { PaymentMethod, PaymentReceipt, PaymentResult } from "./types";

export abstract class PaymentProcessor {
    private static nextReceiptId = 1;

    protected readonly orderId: number;
    protected amount: number;

    constructor(orderId: number, amount: number) {
        this.orderId = orderId;
        this.amount = amount;
    }

    public getOrderId(): number {
        return this.orderId;
    }

    public getAmount(): number {
        return this.amount;
    }

    protected createReceipt(method: PaymentMethod, message: string): PaymentReceipt {
        return {
            id: PaymentProcessor.nextReceiptId++,
            orderId: this.orderId,
            amount: this.amount,
            method,
            message,
        };
    }

    abstract pay(): PaymentResult;
}

export class CodPaymentProcessor extends PaymentProcessor {
    override pay(): PaymentResult {
        const receipt = this.createReceipt(
            "COD",
            `Thanh toán khi nhận hàng (COD) cho đơn #${this.orderId} thành công.`,
        );
        return { status: "success", data: receipt };
    }
}

export class BankTransferProcessor extends PaymentProcessor {
    override pay(): PaymentResult {
        const receipt = this.createReceipt(
            "BANK_TRANSFER",
            `Chuyển khoản ngân hàng cho đơn #${this.orderId} đã được ghi nhận.`,
        );
        return { status: "success", data: receipt };
    }
}

export class EWalletPaymentProcessor extends PaymentProcessor {
    override pay(): PaymentResult {
        const receipt = this.createReceipt(
            "E_WALLET",
            `Thanh toán qua Ví điện tử cho đơn #${this.orderId} hoàn tất.`,
        );
        return { status: "success", data: receipt };
    }
}

// Factory helper trả về kiểu cha PaymentProcessor
export function createPaymentProcessor(
    method: PaymentMethod,
    orderId: number,
    amount: number,
): PaymentProcessor {
    switch (method) {
        case "COD":
            return new CodPaymentProcessor(orderId, amount);
        case "BANK_TRANSFER":
            return new BankTransferProcessor(orderId, amount);
        case "E_WALLET":
            return new EWalletPaymentProcessor(orderId, amount);
    }
}
