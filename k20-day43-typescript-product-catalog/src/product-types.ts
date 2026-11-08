// 1. Khai báo kiểu Product
export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    stock: number;
}

// 2. Danh sách trạng thái cấu hình (as const)
export const PRODUCT_STATUSES = ["in-stock", "low-stock", "out-of-stock"] as const;

// 3. Suy ra kiểu ProductStatus bằng typeof + indexed access [number]
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

// 4. Kiểu cập nhật một phần sản phẩm bằng Partial<Product>
export type ProductUpdate = Partial<Product>;

// 5. Bảng ánh xạ trạng thái sang nhãn tiếng Việt bằng Record<ProductStatus, string>
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
    "in-stock": "Còn hàng",
    "low-stock": "Sắp hết hàng",
    "out-of-stock": "Hết hàng",
};

// 6. Mapped type ProductFieldErrors duyệt qua keyof Product
// Mỗi trường có thể chứa một thông báo lỗi dạng string hoặc không có lỗi (undefined)
export type ProductFieldErrors = {
    [K in keyof Product]?: string;
};
