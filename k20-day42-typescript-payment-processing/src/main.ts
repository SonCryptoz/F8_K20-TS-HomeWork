import "./style.css";
import type { PaymentReceipt } from "./types";
import { isPaymentRequest } from "./validators";
import { findById } from "./utils";
import { createPaymentProcessor, PaymentProcessor } from "./processors";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="container">
        <h1>Module Xử Lý Thanh Toán Đơn Hàng</h1>

        <div class="grid">
            <!-- Cột trái: Form thanh toán -->
            <section class="card">
                <h2>1. Tạo thanh toán</h2>
                <form id="payment-form" novalidate>
                    <div class="form-group">
                        <label for="order-id">Mã đơn hàng (Số nguyên dương):</label>
                        <input type="number" id="order-id" placeholder="VD: 1001" />
                    </div>

                    <div class="form-group">
                        <label for="amount">Số tiền (VNĐ):</label>
                        <input type="number" id="amount" placeholder="VD: 250000" />
                    </div>

                    <div class="form-group">
                        <label for="method">Phương thức thanh toán:</label>
                        <select id="method">
                            <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                            <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                            <option value="E_WALLET">Ví điện tử</option>
                            <option value="INVALID_METHOD">
                                -- Phương thức lỗi (Test Type Guard) --
                            </option>
                        </select>
                    </div>

                    <button type="submit" class="btn-primary">Thanh toán</button>
                </form>

                <!-- Hiển thị trạng thái/kết quả thanh toán -->
                <div id="payment-feedback" class="feedback hidden"></div>
            </section>

            <!-- Cột phải: Tìm kiếm & Danh sách biên nhận -->
            <section class="card">
                <h2>2. Tra cứu biên nhận</h2>
                <div class="search-box">
                    <input
                        type="number"
                        id="search-receipt-id"
                        placeholder="Nhập mã biên nhận (ID)..."
                    />
                    <button type="button" id="search-btn" class="btn-secondary">Tìm biên nhận</button>
                </div>
                <div id="search-result" class="feedback hidden"></div>

                <hr class="divider" />

                <h2>3. Danh sách biên nhận (<span id="receipt-count">0</span>)</h2>
                <ul id="receipt-list" class="receipt-list">
                    <li class="empty-state">Chưa có biên nhận nào.</li>
                </ul>
            </section>
        </div>
    </div>
`;

// Lưu trữ danh sách biên nhận trong phiên chạy hiện tại
const receipts: PaymentReceipt[] = [];

// 1. Truy vấn các phần tử DOM với generic type
const paymentForm = document.querySelector<HTMLFormElement>("#payment-form");
const orderIdInput = document.querySelector<HTMLInputElement>("#order-id");
const amountInput = document.querySelector<HTMLInputElement>("#amount");
const methodSelect = document.querySelector<HTMLSelectElement>("#method");
const paymentFeedback = document.querySelector<HTMLDivElement>("#payment-feedback");

const searchInput = document.querySelector<HTMLInputElement>("#search-receipt-id");
const searchBtn = document.querySelector<HTMLButtonElement>("#search-btn");
const searchResult = document.querySelector<HTMLDivElement>("#search-result");

const receiptListEl = document.querySelector<HTMLUListElement>("#receipt-list");
const receiptCountEl = document.querySelector<HTMLSpanElement>("#receipt-count");

// Kiểm tra selector có trả về phần tử trước khi sử dụng
if (
    !paymentForm ||
    !orderIdInput ||
    !amountInput ||
    !methodSelect ||
    !paymentFeedback ||
    !searchInput ||
    !searchBtn ||
    !searchResult ||
    !receiptListEl ||
    !receiptCountEl
) {
    throw new Error("Không tìm thấy đầy đủ các phần tử DOM cần thiết trên trang.");
}

// Hàm định dạng tiền tệ VNĐ
function formatCurrency(amount: number): string {
    return amount.toLocaleString("vi-VN") + " ₫";
}

// Hàm tạo HTML chi tiết cho 1 biên nhận
function renderReceiptCard(receipt: PaymentReceipt): string {
    return `
    <div class="receipt-header">
        <span>Biên nhận #${receipt.id} (Đơn hàng #${receipt.orderId})</span>
        <span class="badge">${receipt.method}</span>
    </div>
    <div><strong>Số tiền:</strong> ${formatCurrency(receipt.amount)}</div>
    <div><strong>Thông báo:</strong> ${receipt.message}</div>
  `;
}

// Hàm hiển thị thông báo (lỗi hoặc thành công)
function showFeedback(
    element: HTMLDivElement,
    type: "success" | "error",
    htmlContent: string,
): void {
    element.className = `feedback ${type}`;
    element.innerHTML = htmlContent;
}

// Hàm cập nhật danh sách biên nhận trên giao diện
function renderReceiptList(): void {
    if (!receiptListEl || !receiptCountEl) return;

    receiptCountEl.textContent = String(receipts.length);

    if (receipts.length === 0) {
        receiptListEl.innerHTML = `<li class="empty-state">Chưa có biên nhận nào.</li>`;
        return;
    }

    receiptListEl.innerHTML = receipts
        .map((r) => `<li class="receipt-item">${renderReceiptCard(r)}</li>`)
        .join("");
}

// 2. Xử lý sự kiện submit Form thanh toán
paymentForm.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();

    // Dùng instanceof để kiểm tra event.currentTarget
    if (!(event.currentTarget instanceof HTMLFormElement)) {
        return;
    }

    const rawOrderId = orderIdInput.value.trim();
    const rawAmount = amountInput.value.trim();
    const rawMethod = methodSelect.value;

    // Đóng gói dữ liệu từ form dưới dạng unknown trước khi kiểm tra
    const rawData: unknown = {
        orderId: rawOrderId === "" ? NaN : Number(rawOrderId),
        amount: rawAmount === "" ? NaN : Number(rawAmount),
        method: rawMethod,
    };

    // Kiểm tra bằng Type Guard isPaymentRequest
    if (!isPaymentRequest(rawData)) {
        showFeedback(
            paymentFeedback,
            "error",
            `<strong>Dữ liệu không hợp lệ!</strong> Vui lòng kiểm tra lại:<br/>
                - Mã đơn hàng phải là số nguyên dương.<br/>
                - Số tiền phải là số hữu hạn lớn hơn 0.<br/>
                - Phương thức thanh toán phải là COD, BANK_TRANSFER hoặc E_WALLET.
            `,
        );
        return;
    }

    // Dữ liệu hợp lệ: rawData lúc này đã được TypeScript thu hẹp thành kiểu PaymentRequest
    // Khởi tạo processor thông qua kiểu cha PaymentProcessor
    const processor: PaymentProcessor = createPaymentProcessor(
        rawData.method,
        rawData.orderId,
        rawData.amount,
    );

    const result = processor.pay();

    // Xử lý Discriminated Union PaymentResult
    if (result.status === "success") {
        receipts.push(result.data);
        renderReceiptList();

        showFeedback(
            paymentFeedback,
            "success",
            `<strong>Thanh toán thành công!</strong><hr style="margin: 6px 0; border-top: 1px solid #a7f3d0;"/>
            ${renderReceiptCard(result.data)}`,
        );

        paymentForm.reset();
    } else {
        showFeedback(paymentFeedback, "error", `<strong>Lỗi xử lý:</strong> ${result.message}`);
    }
});

// 3. Xử lý sự kiện Tìm biên nhận bằng hàm Generic findById
searchBtn.addEventListener("click", (event: MouseEvent) => {
    if (!(event.currentTarget instanceof HTMLButtonElement)) {
        return;
    }

    const rawSearchId = searchInput.value.trim();
    const idToFind = rawSearchId === "" ? NaN : Number(rawSearchId);

    if (!Number.isInteger(idToFind) || idToFind <= 0) {
        showFeedback(
            searchResult,
            "error",
            "Vui lòng nhập mã biên nhận là một số nguyên dương hợp lệ.",
        );
        return;
    }

    const foundReceipt = findById(receipts, idToFind);

    if (foundReceipt) {
        showFeedback(
            searchResult,
            "success",
            `<strong>Tìm thấy biên nhận:</strong><hr style="margin: 6px 0; border-top: 1px solid #a7f3d0;"/>
       ${renderReceiptCard(foundReceipt)}`,
        );
    } else {
        showFeedback(
            searchResult,
            "error",
            `Không tìm thấy biên nhận nào có mã <strong>#${idToFind}</strong>.`,
        );
    }
});
