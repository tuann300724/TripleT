(function () {
  "use strict";

  const STORAGE_KEY = "triplet_cart_v1";

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

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function subtotal(items) {
    return items.reduce(function (s, x) {
      return s + x.price * x.qty;
    }, 0);
  }

  function render() {
        // Kiểm tra đăng nhập
        const currentUser = localStorage.getItem('tripleT_currentUser');
        const payBtn = document.getElementById('checkout-continue');
        let loginWarn = document.getElementById('checkout-login-warn');
        if (!loginWarn) {
          loginWarn = document.createElement('div');
          loginWarn.id = 'checkout-login-warn';
          loginWarn.style = 'color:#d32f2f;font-size:15px;margin:12px 0;text-align:center;display:none;';
          if (payBtn && payBtn.parentNode) payBtn.parentNode.insertBefore(loginWarn, payBtn);
        }
        if (!currentUser) {
          if (payBtn) payBtn.style.display = 'none';
          loginWarn.textContent = 'Bạn phải đăng nhập để thanh toán.';
          loginWarn.style.display = 'block';
        } else {
          if (payBtn) payBtn.style.display = '';
          loginWarn.style.display = 'none';
        }
    const root = document.getElementById("checkout-items");
    const emptyEl = document.getElementById("checkout-empty");
    const totalEl = document.getElementById("checkout-total");
    const mailBtn = document.getElementById("checkout-mailto");
    const continueBtn = document.getElementById("checkout-continue");

    if (!root || !emptyEl || !totalEl) return;

    const items = loadCart();

    if (items.length === 0) {
      emptyEl.hidden = false;
      root.innerHTML = "";
      totalEl.textContent = formatMoney(0);
      if (mailBtn) mailBtn.hidden = true;
      if (continueBtn) continueBtn.hidden = true;
      return;
    }

    emptyEl.hidden = true;
    if (mailBtn) mailBtn.hidden = false;
    if (continueBtn) continueBtn.hidden = false;

    const sum = subtotal(items);
    totalEl.textContent = formatMoney(sum);

    root.innerHTML = items
      .map(function (line) {
        const imgSrc = "../" + String(line.image || "").replace(/^\//, "");
        return (
          '<article class="checkout-line" style="display:flex;align-items:center;gap:16px;background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(44,62,80,0.07);border:1.5px solid #e0e7ef;margin-bottom:18px;padding:12px 14px;">' +
          '<img class="checkout-line-img" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1.5px solid #e0e7ef;background:#fff;flex-shrink:0;" src="' +
          escapeAttr(imgSrc) +
          '" alt="' +
          escapeAttr(line.name) +
          '">' +
          '<div class="checkout-line-body" style="flex:1;min-width:0;">' +
          '<h2 class="checkout-line-name" style="font-size:15px;margin:0 0 2px 0;color:#1a5c4a;font-weight:600;white-space:normal;word-break:break-word;">' +
          escapeHtml(line.name) +
          "</h2>" +
          '<p class="checkout-line-meta" style="font-size:13px;color:#888;margin:0;">' +
          formatMoney(line.price) +
          " × " +
          line.qty +
          "</p>" +
          '<p class="checkout-line-sub" style="margin:0;font-size:14px;"><strong style="color:#2d8a68;">' +
          formatMoney(line.price * line.qty) +
          "</strong></p>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    const applyBtn = document.getElementById("apply-coupon-btn");
    const couponInput = document.getElementById("coupon-input");
    const msgEl = document.getElementById("coupon-message");
    const discountRow = document.getElementById("discount-row");
    const discountEl = document.getElementById("checkout-discount");
    const finalEl = document.getElementById("checkout-final");
    
    let currentDiscount = localStorage.getItem("triplet_temp_discount") || 0;

    function applyDiscount(percent) {
        currentDiscount = percent;
        localStorage.setItem("triplet_temp_discount", percent);
        const discountAmt = sum * percent;
        const finalAmt = sum - discountAmt;
        
        if (percent > 0) {
            discountRow.style.display = "flex";
            discountEl.textContent = "- " + formatMoney(discountAmt);
            msgEl.textContent = "Áp dụng mã thành công! Bạn được giảm " + (percent*100) + "%";
            msgEl.style.color = "#2d8a68";
            msgEl.style.display = "block";
        } else {
            discountRow.style.display = "none";
        }
        finalEl.textContent = formatMoney(finalAmt);
    }

    if (applyBtn && couponInput) {
        applyBtn.addEventListener("click", () => {
            const code = couponInput.value.trim().toUpperCase();
            if (!code) return;
            
            let validCoupons = JSON.parse(localStorage.getItem('triplet_valid_coupons')) || {};
            if (code === "TRIPLET15") validCoupons[code] = 0.15; // Hardcode mã khuyến mãi tĩnh
            
            if (validCoupons[code]) {
                applyDiscount(validCoupons[code]);
            } else {
                msgEl.textContent = "Mã giảm giá không hợp lệ hoặc đã hết hạn!";
                msgEl.style.color = "#ff3b30";
                msgEl.style.display = "block";
                applyDiscount(0);
            }
        });
    }

    // Init discount from storage
    if (sum > 0) {
        applyDiscount(parseFloat(currentDiscount));
    }

    if (mailBtn) {
      const bodyLines = items.map(function (x, i) {
        return (
          i +
          1 +
          ". " +
          x.name +
          " x" +
          x.qty +
          " — " +
          formatMoney(x.price * x.qty)
        );
      });
      bodyLines.push("", "Tạm tính: " + formatMoney(sum));
      if (currentDiscount > 0) bodyLines.push("Giảm giá: -" + formatMoney(sum * currentDiscount));
      bodyLines.push("Tổng cộng: " + formatMoney(sum * (1 - currentDiscount)));
      bodyLines.push("", "— Đơn đặt từ TripleT Cầu Lông —");
      const subject = encodeURIComponent("Đặt hàng TripleT — giỏ hàng");
      const body = encodeURIComponent(bodyLines.join("\n"));
      mailBtn.href =
        "mailto:TripelTteam@gmail.com?subject=" + subject + "&body=" + body;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
