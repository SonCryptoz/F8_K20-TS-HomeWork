# Quản Lý Danh Mục Sản Phẩm (TypeScript Product Catalog)

Bài tập thực hành TypeScript (Buổi 43 - F8): Ứng dụng `keyof`, Indexed Access Types, `Partial`, `Record`, và Mapped Types để quản lý danh sách sản phẩm trong bộ nhớ.

## Yêu cầu hệ thống

- Node.js (phiên bản 18 trở lên)
- npm (hoặc pnpm / yarn)

## Cách cài đặt

Clone repository về máy và cài đặt các gói phụ thuộc:

```bash
git clone <link-repo-cua-ban>
cd k20-day43-typescript-product-catalog
npm install
```

## Cách chạy chương trình

Chạy trực tiếp chương trình với dữ liệu kiểm thử mẫu:

```bash
npm start
```

Kiểm tra lỗi kiểu dữ liệu (Type-check với cấu hình `strict: true`):

```bash
npm run typecheck
```

Biên dịch mã nguồn TypeScript sang JavaScript (thư mục `dist/`):

```bash
npm run build
```

## Cấu trúc dự án

```text
k20-day43-typescript-product-catalog/
├── src/
│   ├── product-types.ts    # Khai báo kiểu dữ liệu, hằng cấu hình và Mapped Types
│   ├── product-service.ts  # Các hàm xử lý nghiệp vụ quản lý sản phẩm
│   └── main.ts             # Điểm chạy chính, thực thi các kịch bản kiểm thử
├── package.json
├── tsconfig.json
└── README.md
```

## Chức năng từng file chính

### 1. `src/product-types.ts`

- Khai báo interface `Product` gồm các thuộc tính: `id`, `name`, `price`, `category`, `stock`.
- Khai báo danh sách trạng thái cấu hình `PRODUCT_STATUSES` với `as const` và suy diễn kiểu `ProductStatus` thông qua `(typeof PRODUCT_STATUSES)[number]`.
- Khai báo kiểu `ProductUpdate` bằng `Partial<Product>` phục vụ việc cập nhật một phần thông tin sản phẩm.
- Khai báo bảng ánh xạ trạng thái sang nhãn tiếng Việt `PRODUCT_STATUS_LABELS` bằng `Record<ProductStatus, string>`.
- Khai báo Mapped Type `ProductFieldErrors` duyệt qua `keyof Product` để lưu trữ thông báo lỗi tương ứng cho từng trường.

### 2. `src/product-service.ts`

- Khởi tạo mảng dữ liệu sản phẩm mẫu trong bộ nhớ với kiểu `Product[]`.
- **`getAllProducts()`**: Trả về danh sách toàn bộ sản phẩm hiện có.
- **`findProductById(id)`**: Tìm kiếm sản phẩm theo `id`, trả về `Product` hoặc `undefined`.
- **`getProductField(product, key)`**: Đọc giá trị một trường của sản phẩm dựa trên `keyof Product` và kiểu trả về Indexed Access `Product[K]`.
- **`updateProduct(id, update)`**: Cập nhật một phần thông tin sản phẩm theo `ProductUpdate` (không làm thay đổi trực tiếp object truyền vào từ bên ngoài).
- **`filterBy<T, K T extends keyof>(items, key, value)`**: Hàm generic lọc danh sách theo trường bất kỳ, đảm bảo kiểu của `value` luôn khớp chặt chẽ với kiểu của `key` (`T[K]`).
- **`getStockStatus(stock)` & `getProductStatusLabel(product)`**: Xác định trạng thái tồn kho (`in-stock`, `low-stock`, `out-of-stock`) và trả về nhãn tiếng Việt tương ứng từ bảng `Record`.
- **`validateProductUpdate(update)`**: Kiểm tra tính hợp lệ của dữ liệu cập nhật và trả về kết quả theo kiểu `ProductFieldErrors`.

### 3. `src/main.ts`

- Sử dụng `import type` để nhập các kiểu dữ liệu (`Product`, `ProductUpdate`) tách biệt với các hàm xử lý.
- Chạy và in kết quả rõ ràng ra màn hình console cho 6 tình huống kiểm thử:
    1. In toàn bộ danh sách sản phẩm kèm nhãn tồn kho tiếng Việt.
    2. Tìm sản phẩm với ID tồn tại và ID không tồn tại (kèm minh họa `getProductField`).
    3. Cập nhật riêng giá của một sản phẩm, giữ nguyên các trường còn lại.
    4. Cập nhật đồng thời tên và số lượng tồn kho của một sản phẩm.
    5. Lọc sản phẩm theo trường chuỗi (`category`) và trường số (`stock`) bằng hàm generic `filterBy`.
    6. Xử lý và in thông báo rõ ràng khi cập nhật sản phẩm với ID không tồn tại.
