type CartItem = {
    readonly productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
};

type Cart = {
    cartId: string;
    currency: "VND";
    items: readonly CartItem[];
    couponCode?: string;
};

export { CartItem, Cart };
