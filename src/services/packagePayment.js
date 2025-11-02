// src/services/packagePayment.js

/**
 * GỌI API: /api/payment/init-package-payment
 * → Khởi tạo thanh toán gói (trả về QR + mã GD)
 * @param {Object} payload
 * @param {number} payload.packageId - ID gói
 * @param {string} [payload.customerName] - Tên khách (mặc định: "Khách hàng")
 * @param {string} [payload.customerEmail] - Email (mặc định: "khach@example.com")
 * @param {string} [payload.customerPhone] - SĐT (mặc định: "0900000000")
 * @returns {Promise<Object>} { qrCode, transactionCode, amount }
 */
export const initPackagePayment = async (payload) => {
  const url = `http://localhost:8080/api/payment/init-package-payment`;

  const params = new URLSearchParams();
  params.append("packageId", payload.packageId);
  params.append("customerName", payload.customerName || "Khách hàng");
  params.append("customerEmail", payload.customerEmail || "khach@example.com");
  params.append("customerPhone", payload.customerPhone || "0900000000");

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    if (data.status !== "success") {
      throw new Error(data.message || "Khởi tạo thanh toán thất bại");
    }

    return {
      qrCode: data.qrCode,
      transactionCode: data.transactionCode,
      amount: data.amount,
    };
  } catch (error) {
    console.error("Lỗi initPackagePayment:", error);
    throw new Error(error.message || "Không thể khởi tạo thanh toán");
  }
};

/**
 * GIẢ LẬP THANH TOÁN → GỌI BE LƯU DB
 * @param {string} transactionCode - Mã giao dịch
 */
export const mockPackagePayment = async (transactionCode) => {
  const url = `http://localhost:8080/api/payment/mock-payment?transactionCode=${transactionCode}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HTTP ${response.status}: ${err}`);
    }

    const data = await response.json();
    if (data.status !== "success") {
      throw new Error(data.message || "Giả lập thất bại");
    }

    return data;
  } catch (error) {
    console.error("Lỗi mockPackagePayment:", error);
    throw error;
  }
};

/**
 * LẤY KẾT QUẢ GIAO DỊCH TỪ DB
 * @param {string} transactionCode - Mã giao dịch
 */
export const getTransactionStatus = async (transactionCode) => {
  const url = `http://localhost:8080/api/payment/transaction-status/${transactionCode}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi getTransactionStatus:", error);
    throw error;
  }
};