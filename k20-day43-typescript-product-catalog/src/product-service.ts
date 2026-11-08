import {
    PRODUCT_STATUS_LABELS,
    type Product,
    type ProductFieldErrors,
    type ProductStatus,
    type ProductUpdate,
} from "./product-types.js";

// Dữ liệu mẫu khởi tạo
const products: Product[] = [
    {
        id: 101,
        name: "Laptop Air",
        price: 24990000,
        category: "computer",
        stock: 8,
    },
    {
        id: 102,
        name: "Chuột không dây",
        price: 450000,
        category: "accessory",
        stock: 4,
    },
    {
        id: 103,
        name: "Bàn phím cơ",
        price: 1290000,
        category: "accessory",
        stock: 12,
    },
    {
        id: 104,
        name: "Màn hình 27 inch",
        price: 5990000,
        category: "computer",
        stock: 0,
    },
    {
        id: 105,
        name: "Tai nghe Bluetooth",
        price: 1890000,
        category: "audio",
        stock: 5,
    },
];

// Lấy danh sách sản phẩm (trả về bản sao để tránh bị mutate mảng gốc từ bên ngoài)
export function getAllProducts(): Product[] {
    return products.map((product) => ({ ...product }));
}

// Tìm sản phẩm theo ID
export function findProductById(id: number): Product | undefined {
    const found = products.find((p) => p.id === id);
    return found ? { ...found } : undefined;
}

// Đọc một trường của sản phẩm: Dùng keyof Product và Indexed Access Product[K]
export function getProductField<K extends keyof Product>(product: Product, key: K): Product[K] {
    return product[key];
}

// Cập nhật một phần thông tin sản phẩm (không mutate object update truyền vào)
export function updateProduct(id: number, update: ProductUpdate): Product | undefined {
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
        return undefined;
    }

    const currentProduct = products[index];

    // Chỉ ghi đè các trường được cung cấp (khác undefined), giữ nguyên id gốc
    const updatedProduct: Product = {
        id: currentProduct.id,
        name: update.name !== undefined ? update.name : currentProduct.name,
        price: update.price !== undefined ? update.price : currentProduct.price,
        category: update.category !== undefined ? update.category : currentProduct.category,
        stock: update.stock !== undefined ? update.stock : currentProduct.stock,
    };

    products[index] = updatedProduct;
    return { ...updatedProduct };
}

// Hàm generic lọc danh sách theo một trường bất kỳ
export function filterBy<T, K extends keyof T>(items: T[], key: K, value: T[K]): T[] {
    return items.filter((item) => item[key] === value);
}

// Xác định trạng thái tồn kho dựa trên số lượng stock
export function getStockStatus(stock: number): ProductStatus {
    if (stock === 0) {
        return "out-of-stock";
    }
    if (stock >= 1 && stock <= 5) {
        return "low-stock";
    }
    return "in-stock";
}

// Lấy nhãn trạng thái tiếng Việt từ bảng Record
export function getProductStatusLabel(product: Product): string {
    const status = getStockStatus(product.stock);
    return PRODUCT_STATUS_LABELS[status];
}

// Hàm minh họa việc sử dụng Mapped Type ProductFieldErrors để kiểm tra dữ liệu cập nhật
export function validateProductUpdate(update: ProductUpdate): ProductFieldErrors {
    const errors: ProductFieldErrors = {};

    if (update.name !== undefined && update.name.trim() === "") {
        errors.name = "Tên sản phẩm không được để trống";
    }
    if (update.price !== undefined && update.price < 0) {
        errors.price = "Giá sản phẩm không được âm";
    }
    if (update.stock !== undefined && update.stock < 0) {
        errors.stock = "Số lượng tồn kho không được âm";
    }

    return errors;
}