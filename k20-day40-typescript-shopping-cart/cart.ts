import { CartItem, Cart } from "./types";

// 1. Thêm món vào giỏ (trả về giỏ mới, không sửa giỏ cũ)
const addItem = (cart: Cart, item: CartItem): Cart => {
    // Validate
    if (!item.productId || item.productId.trim() === "") {
        throw new Error("Id sản phẩm không được để trống");
    }
    if (!item.name || item.name.trim() === "") {
        throw new Error("Tên sản phẩm không được để trống.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error("Số lượng phải là số nguyên lớn hơn 0.");
    }
    if (typeof item.unitPrice !== "number" || Number.isNaN(item.unitPrice) || item.unitPrice < 0) {
        throw new Error("Đơn giá phải là số không âm.");
    }

    // Kiểm tra xem productId đã tồn tại trong giỏ chưa
    const existingIndex = cart.items.findIndex((existingItem) => {
        return existingItem.productId === item.productId;
    });

    let newItems: CartItem[];

    if (existingIndex !== -1) {
        // Đã có: tạo mảng mới và object mới cho dòng được cập nhật, giữ nguyên name và unitPrice cũ
        newItems = cart.items.map((existingItem, index) => {
            return existingIndex === index
                ? {
                      ...existingItem,
                      quantity: existingItem.quantity + item.quantity,
                  }
                : existingItem;
        });
    } else {
        // Chưa có: thêm dòng mới ở cuối danh sách (tạo bản sao object mới)
        newItems = [...cart.items, { ...item }];
    }

    return {
        ...cart,
        items: newItems,
    };
};

// 2. Tính tạm tính (chưa giảm giá, chưa tính ship)
const subtotal = (cart: Cart): number => {
    return cart.items.reduce((total, item) => {
        total += item.unitPrice * item.quantity;
        return total;
    }, 0);
};

// 3. Tính tiền giảm giá
const discount = (cart: Cart): number => {
    return cart.couponCode === "SALE10" ? Math.round(subtotal(cart) * 0.1) : 0;
};

// 4. Tính phí ship
const shippingFee = (amountAfterDiscount: number): number => {
    return amountAfterDiscount >= 500_000 ? 0 : 30_000;
};

// 5. Định dạng tiền tệ (예: 1250000 -> "1.250.000₫", không có khoảng trắng)
const formatMoney = (value: number): string => {
    return `${new Intl.NumberFormat("vi-VN").format(value)}₫`;
};

// 6. Tìm khoảng giá [thấp nhất, cao nhất] theo unitPrice
const priceRange = (cart: Cart): [number, number] => {
    if (cart.items.length === 0) {
        throw new Error("Giỏ hàng đang rỗng, không thể tìm khoảng giá.");
    }

    const prices = cart.items.map((item) => item.unitPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return [minPrice, maxPrice];
};

// 7. Giả lập gọi API kiểm tra mã giảm giá
const validateCoupon = async (code: string): Promise<boolean> => {
    return code.trim() === "SALE10";
};

// 8. In hóa đơn dạng text
const renderInvoice = (cart: Cart): string => {
    const sub = subtotal(cart);
    const disc = discount(cart);
    const amountAfterDiscount = sub - disc;
    const ship = shippingFee(amountAfterDiscount);
    const total = amountAfterDiscount + ship;

    const itemLines = cart.items.map((item, index) => {
        const lineTotal = item.unitPrice * item.quantity;
        return `
${index + 1}. ${item.name}
    - Số lượng: ${item.quantity}
    - Đơn giá: ${formatMoney(item.unitPrice)}
    - Thành tiền: ${formatMoney(lineTotal)}
            `;
    });

    return [
        `-------- Hóa đơn giỏ hàng (${cart.cartId}) --------`,
        ...itemLines,
        `---------------------------------------------------`,
        `Tạm tính:                     ${formatMoney(sub)}`,
        `Giảm giá:                     -${formatMoney(disc)}`,
        `Phí ship:                     ${formatMoney(ship)}`,
        `Tổng phải trả:                ${formatMoney(total)}`,
    ].join("\n");
};

export {
    addItem,
    subtotal,
    discount,
    shippingFee,
    formatMoney,
    priceRange,
    validateCoupon,
    renderInvoice,
};
