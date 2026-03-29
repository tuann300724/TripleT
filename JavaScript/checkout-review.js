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
          '<article class="checkout-line">' +
          '<img class="checkout-line-img" src="' +
          escapeAttr(imgSrc) +
          '" alt="' +
          escapeAttr(line.name) +
          '">' +
          '<div class="checkout-line-body">' +
          '<h2 class="checkout-line-name">' +
          escapeHtml(line.name) +
          "</h2>" +
          '<p class="checkout-line-meta">' +
          formatMoney(line.price) +
          " × " +
          line.qty +
          "</p>" +
          '<p class="checkout-line-sub"><strong>' +
          formatMoney(line.price * line.qty) +
          "</strong></p>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

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
