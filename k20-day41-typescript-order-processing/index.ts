import { createOrder, formatPhone, getOrderStatusMessage, handleOrderResult } from "./cart";
import { OrderMetadata, Product, ShippingInfo, User } from "./interface";
import { PaymentMethod } from "./type";

const users: User[] = [
    {
        id: 1, // Nếu là 0 thì đơn hàng không được tạo
        fullName: "Nguyen Van An",
        email: "an@example.com",
        phone: "0901234567",
    },
];

const products: Product[] = [
    {
        id: 101,
        name: "Laptop",
        price: 15000000,
        stock: 5,
        category: "computer",
    },
    {
        id: 102,
        name: "Wireless Mouse",
        price: 350000,
        stock: 10,
        category: "accessory",
    },
];

const cart = [
    { productId: 101, quantity: 1 },
    { productId: 102, quantity: 2 },
];

const shippingInfo: ShippingInfo = {
    receiverName: "Nguyen Van B",
    receiverPhone: "0912345678",
    address: "Ha Noi",
};

const paymentMethod: PaymentMethod = "COD";

const metadata: OrderMetadata = {
    note: "Giao hàng vào buổi sáng",
    couponCode: "WELCOME10",
};

// Gọi hàm createOrder
const currentUser = users[0];
console.log("SĐT người đặt:", formatPhone(currentUser?.phone));

const order = createOrder(currentUser, products, cart, shippingInfo, paymentMethod, metadata);

handleOrderResult(order);

if (order.status === "error") {
    console.log(order.message);
} else {
    console.log("Trạng thái:", getOrderStatusMessage(order.data.status));
    console.log("Chi tiết đơn hàng\n", order.data);
}
