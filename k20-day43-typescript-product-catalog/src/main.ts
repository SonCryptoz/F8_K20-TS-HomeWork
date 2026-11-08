import type { Product, ProductUpdate } from "./product-types.js";
import {
    filterBy,
    findProductById,
    getAllProducts,
    getProductField,
    getProductStatusLabel,
    updateProduct,
    validateProductUpdate,
} from "./product-service.js";

function formatVND(amount: number): string {
    return amount.toLocaleString("vi-VN") + " đ";
}

function printProduct(product: Product): void {
    const statusLabel = getProductStatusLabel(product);
    console.log(
        `[ID: ${product.id}] ${product.name.padEnd(20)} | Danh mục: ${product.category.padEnd(10)} | Giá: ${formatVND(product.price).padEnd(14)} | Kho: ${String(product.stock).padEnd(3)} (${statusLabel})`,
    );
}

console.log("=== 1. DANH SÁCH TOÀN BỘ SẢN PHẨM VÀ NHÃN TỒN KHO ===");
const allProducts = getAllProducts();
allProducts.forEach(printProduct);

console.log("\n=== 2. TÌM SẢN PHẨM THEO ID ===");
const existingId = 102;
const foundProduct = findProductById(existingId);
console.log(`Tìm ID ${existingId} (Tồn tại):`);
if (foundProduct) {
    printProduct(foundProduct);
    // Minh họa hàm getProductField dùng keyof Product và Product[K]
    const productName: string = getProductField(foundProduct, "name");
    const productPrice: number = getProductField(foundProduct, "price");
    console.log(
        `-> Đọc trường bằng getProductField: Tên = "${productName}", Giá = ${formatVND(productPrice)}`,
    );
}

const nonExistingId = 999;
const notFoundProduct = findProductById(nonExistingId);
console.log(
    `Tìm ID ${nonExistingId} (Không tồn tại):`,
    notFoundProduct ?? "Không tìm thấy sản phẩm (undefined)",
);

console.log("\n=== 3. CẬP NHẬT RIÊNG GIÁ CỦA MỘT SẢN PHẨM (ID: 101) ===");
const priceUpdate: ProductUpdate = { price: 22990000 };
const updated101 = updateProduct(101, priceUpdate);
if (updated101) {
    console.log("Sau khi cập nhật giá (các trường khác giữ nguyên):");
    printProduct(updated101);
}

console.log("\n=== 4. CẬP NHẬT TÊN VÀ SỐ LƯỢNG TỒN KHO CÙNG LÚC (ID: 104) ===");
const multiUpdate: ProductUpdate = {
    name: "Màn hình 27 inch 4K",
    stock: 3,
};
const updated104 = updateProduct(104, multiUpdate);
if (updated104) {
    console.log("Sau khi cập nhật tên và stock (từ Hết hàng -> Sắp hết hàng):");
    printProduct(updated104);
}

console.log("\n=== 5. LỌC SẢN PHẨM BẰNG GENERIC filterBy ===");
const currentCatalog = getAllProducts();

console.log('- Lọc theo trường chuỗi (category === "accessory"):');
const accessories = filterBy(currentCatalog, "category", "accessory");
accessories.forEach(printProduct);

console.log("- Lọc theo trường số (stock === 5):");
const stockFiveProducts = filterBy(currentCatalog, "stock", 5);
stockFiveProducts.forEach(printProduct);

// Minh họa kiểm tra kiểu của TypeScript khi truyền key và value không tương thích:
// filterBy(currentCatalog, "category", 123); // Lỗi: Argument of type 'number' is not assignable to parameter of type 'string'.
// filterBy(currentCatalog, "stock", "5");    // Lỗi: Argument of type 'string' is not assignable to parameter of type 'number'.

console.log("\n=== 6. CẬP NHẬT SẢN PHẨM VỚI ID KHÔNG TỒN TẠI (ID: 888) ===");
const invalidIdResult = updateProduct(888, { price: 500000 });
if (!invalidIdResult) {
    console.log(
        "Kết quả: Không thể cập nhật vì không tìm thấy sản phẩm có ID = 888 (Trả về undefined).",
    );
}

console.log("\n=== [BỔ SUNG] MINH HỌA MAPPED TYPE ProductFieldErrors ===");
const invalidUpdate: ProductUpdate = { name: "   ", price: -1000 };
const validationErrors = validateProductUpdate(invalidUpdate);
console.log("Lỗi kiểm tra dữ liệu không hợp lệ:", validationErrors);
