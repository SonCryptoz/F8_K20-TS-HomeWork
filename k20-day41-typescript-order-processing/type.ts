import { Order, Product } from "./interface";

type PaymentMethod = "COD" | "BANK_TRANSFER" | "E_WALLET";

type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";

type OrderResult = { status: "success"; data: Order } | { status: "error"; message: string };

type AuditInfo = {
    createdBy: number;
    updatedAt: Date;
};

type ManagedProduct = Product & AuditInfo;

export { PaymentMethod, OrderStatus, OrderResult, AuditInfo, ManagedProduct };
