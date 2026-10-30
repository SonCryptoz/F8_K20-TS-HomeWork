import { OrderStatus, PaymentMethod } from "./type";

interface BaseEntity {
    id: number;
}

interface Product extends BaseEntity {
    name: string;
    price: number;
    stock: number;
    category: string;
}

interface User extends BaseEntity {
    fullName: string;
    email: string;
    phone?: string;
}

interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
}

interface ShippingInfo {
    receiverName: string;
    receiverPhone: string;
    address: string;
}

interface Order extends BaseEntity, ShippingInfo {
    userId: number;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    createdAt: Date;
    metadata?: OrderMetadata;
}   

interface OrderMetadata {
    note?: string;
}

interface OrderMetadata {
    couponCode?: string;
}

export { Product, User, OrderItem, ShippingInfo, Order, OrderMetadata };
