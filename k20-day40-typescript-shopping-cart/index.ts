import { Cart, CartItem } from "./types";
import { addItem, subtotal, priceRange, renderInvoice, formatMoney, validateCoupon } from "./cart";

const runDemo = async (): Promise<void> => {
    // Kiểm tra thử mã giảm giá bằng validateCoupon
    const code = "  SALE10  kfjgkf";
    const isValid = await validateCoupon(code);

    // 1. Tạo giỏ
    let myCart: Cart = {
        cartId: "C01",
        currency: "VND",
        items: [],
        couponCode: isValid ? code.trim() : undefined,
    };

    // 2. Sản phẩm mua
    const poloShirt: CartItem = {
        productId: "AO01",
        name: "Áo Polo Navy Slim-fit",
        quantity: 2,
        unitPrice: 350_000,
    };

    const jacket: CartItem = {
        productId: "AO02",
        name: "Áo Khoác Gió Chống Nước",
        quantity: 1,
        unitPrice: 550_000,
    };

    // TODO: Bonus
    const iPhoneDuo: CartItem = {
        productId: "IPDOU1",
        name: "iPhone Duo",
        quantity: 1,
        unitPrice: 65_990_000,
    };

    const rtxCard: CartItem = {
        productId: "RTX02",
        name: "Nvidia RTX 5090Ti",
        quantity: -1,
        unitPrice: 150_000_000,
    };

    const headphone: CartItem = {
        productId: "HP03",
        name: "AirPods Max",
        quantity: 1,
        unitPrice: 18_990_000,
    };

    // 3. Thêm 2 món vào giỏ
    myCart = addItem(myCart, poloShirt);
    myCart = addItem(myCart, jacket);

    // 4. In subtotal và priceRange
    const sub: number = subtotal(myCart);
    console.log("Giá tạm tính:", formatMoney(sub));

    const [minPrice, maxPrice]: [number, number] = priceRange(myCart);
    console.log(`Khoảng đơn giá: ${formatMoney(minPrice)} - ${formatMoney(maxPrice)}\n`);

    // 5. In hóa đơn
    console.log(renderInvoice(myCart));
};

runDemo();
