(function () {
  "use strict";

  const STORAGE_KEY = "triplet_cart_v1";

  // 1. Lấy dữ liệu giỏ hàng từ LocalStorage
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function formatMoney(n) {
    return new Intl.NumberFormat("vi-VN").format(n) + "₫";
  }

  // 2. Tính tổng tiền (Đây là con số chuẩn nhất để gửi đi)
  function subtotal(items) {
    return items.reduce(function (s, x) {
      return s + (Number(x.price) || 0) * (Number(x.qty) || 0);
    }, 0);
  }

  function showVnpayError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideVnpayError(el) {
    if (el) { el.hidden = true; el.textContent = ""; }
  }

  function init() {
    const form = document.getElementById("payment-form");
    const totalBar = document.getElementById("pay-total-bar");
    const totalEl = document.getElementById("pay-order-total");
    const emptyNote = document.getElementById("pay-empty-note");
    const successBox = document.getElementById("pay-success");
    const submitBtn = document.getElementById("pay-submit");
    const vnpayErr = document.getElementById("vnpay-error") || document.getElementById("momo-error");

    if (!form || !totalBar || !totalEl || !emptyNote) return;

    const items = loadCart();
    if (items.length === 0) {
      totalBar.hidden = true;
      emptyNote.hidden = false;
      form.hidden = true;
      return;
    }

    // Hiển thị tổng tiền lên giao diện
    const currentSum = subtotal(items);
    totalEl.textContent = formatMoney(currentSum);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideVnpayError(vnpayErr);

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Lấy phương thức thanh toán
      const method = form.querySelector('input[name="payment_method"]:checked')?.value || "cash";
      
      // Lấy thông tin khách hàng
      const name = document.getElementById("pay-name")?.value || "Khach hang";

      // Tính lại giá tiền một lần nữa để đảm bảo chính xác nhất trước khi gửi
      const finalAmount = subtotal(loadCart());

      // --- XỬ LÝ VNPAY ---
      if (method === "vnpay" || method === "momo") {
        if (finalAmount < 5000) {
          showVnpayError(vnpayErr, "Số tiền thanh toán VNPay tối thiểu là 5.000₫.");
          return;
        }

        const orderId = "TRIPLET_" + Date.now();
        // Xóa dấu tiếng Việt trong tên khách để tránh lỗi chữ ký (SecureHash)
        const cleanName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
        const orderInfo = `Thanh toan don hang ${orderId} - KH: ${cleanName}`;

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Đang kết nối VNPay...";
        }

        window.tripletVnpayCreatePayment({
          amount: finalAmount, // Gửi con số thuần (ví dụ: 500000)
          orderId: orderId,
          orderInfo: orderInfo
        })
        .then(data => {
          if (data && data.paymentUrl) {
            window.location.href = data.paymentUrl;
          } else {
            throw new Error(data.message || "Lỗi không xác định từ server.");
          }
        })
        .catch(err => {
          showVnpayError(vnpayErr, "Lỗi: " + err.message);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Hoàn tất đặt hàng";
          }
        });

        return;
      }

      // XỬ LÝ TIỀN MẶT (COD)
      successBox.classList.add("is-visible");
      submitBtn.disabled = true;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();