# Module Xử Lý Thanh Toán Đơn Hàng (TypeScript)

Bài tập Buổi 42: Type guards, Generic, DOM types, OOP trong TypeScript.

## 1. Hướng dẫn cài đặt và chạy dự án

Yêu cầu máy đã cài đặt Node.js.

```bash
# Cài đặt các gói phụ thuộc (dependencies)
npm install

# Chạy môi trường phát triển (development server)
npm run dev

# (Tùy chọn) Kiểm tra lỗi TypeScript và build bản production
npm run build
```

Sau khi chạy `npm run dev`, mở trình duyệt tại địa chỉ hiển thị trên terminal (thường là `http://localhost:5173`).

## 2. Mô tả cách các Class xử lý thanh toán phối hợp với nhau

Hệ thống xử lý thanh toán được thiết kế theo hướng đối tượng (OOP) sử dụng các tính chất **Trừu tượng (Abstraction)**, **Kế thừa (Inheritance)**, **Đóng gói (Encapsulation)** và **Đa hình (Polymorphism)**:

- **Lớp cha trừu tượng (`PaymentProcessor`)**:
    - Đóng vai trò là khuôn mẫu chung cho mọi phương thức thanh toán, nhận `orderId` và `amount` qua `constructor`.
    - Đóng gói dữ liệu với `protected readonly orderId: number` (đảm bảo mã đơn hàng không thể bị sửa đổi sau khi khởi tạo) và `protected amount: number`, đi kèm các phương thức getter.
    - Cung cấp phương thức `protected createReceipt()` kết hợp biến tĩnh `private static nextReceiptId` để tự động cấp phát mã biên nhận (`id`) tăng dần duy nhất cho từng giao dịch.
    - Khai báo phương thức trừu tượng `abstract pay(): PaymentResult` buộc tất cả các lớp con phải triển khai.

- **Ba lớp con cụ thể (`CodPaymentProcessor`, `BankTransferProcessor`, `EWalletPaymentProcessor`)**:
    - Cùng kế thừa từ `PaymentProcessor`.
    - Mỗi lớp ghi đè (`override`) phương thức `pay()` để tạo biên nhận (`PaymentReceipt`) với mã phương thức (`COD`, `BANK_TRANSFER`, `E_WALLET`) và thông báo xác nhận riêng biệt, sau đó trả về kết quả theo kiểu discriminated union `PaymentResult`.

- **Sự phối hợp khi chạy ứng dụng (Đa hình thông qua kiểu cha)**:
    - Khi người dùng gửi form và dữ liệu vượt qua bước kiểm tra của Type Guard `isPaymentRequest()`, hàm `createPaymentProcessor()` sẽ dựa vào trường `method` để khởi tạo instance của class con tương ứng nhưng trả về dưới kiểu dữ liệu của lớp cha là `PaymentProcessor`.
    - Nhờ tính đa hình, code xử lý sự kiện tại `main.ts` chỉ cần gọi `processor.pay()` thông qua kiểu cha `PaymentProcessor` để nhận về `PaymentResult` và cập nhật giao diện mà không cần phụ thuộc vào chi tiết cài đặt của từng lớp con.
