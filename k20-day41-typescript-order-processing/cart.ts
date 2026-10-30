import { Order, OrderItem, OrderMetadata, Product, ShippingInfo, User } from "./interface";
import { OrderResult, OrderStatus, PaymentMethod } from "./type";

// Hàm để định dạng số tiền theo định dạng tiền tệ Việt Nam
const formatMoney = (value: number): string => {
    return `${new Intl.NumberFormat("vi-VN").format(value)}₫`;
};

// Tạo một hàm để lấy thông điệp trạng thái đơn hàng dựa trên OrderStatus
const getOrderStatusMessage = (status: OrderStatus): string => {
    switch (status) {
        case "pending":
            return "Đơn hàng đang chờ xác nhận";
        case "confirmed":
            return "Đơn hàng đã được xác nhận";
        case "shipping":
            return "Đơn hàng đang được giao";
        case "completed":
            return "Đơn hàng đã giao thành công";
        case "cancelled":
            return "Đơn hàng đã bị hủy";
        default:
            return "Đơn hàng có trạng thái không xác định. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.";
    }
};

// Xử lý kết quả API
const handleOrderResult = (result: OrderResult): void => {
    if (result.status === "success") {
        console.log(`
Đơn hàng được tạo thành công! 
Mã đơn hàng: ${result.data.id}, 
Tổng tiền: ${formatMoney(result.data.totalAmount)}
                `);
    } else {
        console.error("Lỗi khi tạo đơn hàng:", result.message);
    }
};

// Tìm sản phẩm theo ID
const findProductById = (products: Product[], id: number): Product | undefined => {
    return products.find((product) => product.id === id);
};

// Lấy tên sản phẩm
const getProductName = (product: Product | undefined): string => {
    return product ? product.name : "Sản phẩm không tồn tại";
};

// Định dạng số điện thoại
const formatPhone = (phone: string | null | undefined): string => {
    if (!phone || phone.trim() === "") {
        return "Chưa cập nhật";
    }
    return phone.trim();
};

// Tạo một hàm để tạo đơn hàng mới
let orderId = 1000;

const createOrder = (
    user: User | undefined,
    products: Product[],
    cart: {
        productId: number;
        quantity: number;
    }[],
    shippingInfo: ShippingInfo,
    paymentMethod: PaymentMethod,
    metadata?: OrderMetadata,
): OrderResult => {
    // Kiểm tra người dùng
    if (!user || !user.id || !user.fullName || !user.email || !user.phone) {
        return {
            status: "error",
            message: "Người dùng không hợp lệ",
        };
    }

    // Kiểm tra giỏ hàng
    if (!cart || cart.length === 0) {
        return {
            status: "error",
            message: "Giỏ hàng trống",
        };
    }

    // Kiểm tra dữ liệu sản phẩm
    for (const product of products) {
        if (
            !Number.isFinite(product.price) ||
            product.price < 0 ||
            !Number.isInteger(product.stock) ||
            product.stock < 0
        ) {
            return {
                status: "error",
                message: "Dữ liệu sản phẩm không hợp lệ",
            };
        }
    }

    for (const item of cart) {
        // Kiểm tra sản phẩm trong giỏ hàng
        const product = findProductById(products, item.productId);
        if (!product) {
            return {
                status: "error",
                message: `Sản phẩm với ID ${item.productId} không tồn tại`,
            };
        }

        // Kiểm tra số lượng mua
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            return {
                status: "error",
                message: `Số lượng mua của sản phẩm với ID ${item.productId} phải là số nguyên dương và phải lớn hơn 0`,
            };
        }

        // Kiểm tra tồn kho
        if (item.quantity > product.stock) {
            return {
                status: "error",
                message: `Số lượng mua của sản phẩm ${getProductName(product)} vượt quá tồn kho`,
            };
        }
    }

    // Xử lý sản phẩm trùng nhau, có thì báo lỗi
    const productIds = cart.map((item) => item.productId);
    const uniqueProductIds = new Set(productIds);
    if (productIds.length !== uniqueProductIds.size) {
        return {
            status: "error",
            message: "Giỏ hàng chứa các sản phẩm trùng nhau",
        };
    }

    // Kiểm tra thông tin giao hàng
    if (
        shippingInfo.receiverName.trim() === "" ||
        shippingInfo.receiverPhone.trim() === "" ||
        shippingInfo.address.trim() === ""
    ) {
        return {
            status: "error",
            message: "Thông tin giao hàng không hợp lệ",
        };
    }

    // Tính tổng tiền
    let totalAmount = 0;
    for (const item of cart) {
        const product = findProductById(products, item.productId);
        if (product) {
            totalAmount += product.price * item.quantity;
        }
    }

    // Tạo danh sách OrderItem
    const orderItems: OrderItem[] = cart.map((item) => {
        const product = findProductById(products, item.productId);
        return {
            productId: item.productId,
            productName: product ? product.name : "Sản phẩm không tồn tại",
            quantity: item.quantity,
            unitPrice: product ? product.price : 0,
        };
    });

    // Tạo đơn hàng
    const newOrder: Order = {
        id: ++orderId,
        userId: user.id,
        items: orderItems,
        totalAmount,
        status: "pending",
        paymentMethod,
        createdAt: new Date(),
        receiverName: shippingInfo.receiverName.trim(),
        receiverPhone: shippingInfo.receiverPhone.trim(),
        address: shippingInfo.address.trim(),
        metadata,
    };

    return {
        status: "success",
        data: newOrder,
    };
};

export { createOrder, handleOrderResult, getOrderStatusMessage, formatPhone };
