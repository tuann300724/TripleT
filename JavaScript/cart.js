(function () {
  "use strict";

  const STORAGE_KEY = "triplet_cart_v1";

  const els = {
    backdrop: null,
    drawer: null,
    toggle: null,
    close: null,
    badge: null,
    empty: null,
    lines: null,
    subtotal: null,
    checkout: null,
    clear: null,
    countSummary: null,
    toast: null,
  };

  /** @returns {{ id: string, name: string, price: number, image: string, qty: number }[]} */
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

  function saveCart(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function formatMoney(n) {
    return new Intl.NumberFormat("vi-VN").format(n) + "₫";
  }

  function getCart() {
    return loadCart();
  }

  function setCart(items) {
    saveCart(items);
    render();
  }

  function addProduct(product) {
    const items = getCart();
    const i = items.findIndex((x) => x.id === product.id);
    if (i >= 0) {
      items[i].qty += 1;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1,
      });
    }
    setCart(items);
  }

  function setQty(id, qty) {
    let items = getCart();
    const q = Math.max(0, Math.min(99, parseInt(String(qty), 10) || 0));
    if (q === 0) {
      items = items.filter((x) => x.id !== id);
    } else {
      const line = items.find((x) => x.id === id);
      if (line) line.qty = q;
    }
    setCart(items);
  }

  function removeLine(id) {
    setCart(getCart().filter((x) => x.id !== id));
  }

  function subtotal(items) {
    return items.reduce((s, x) => s + x.price * x.qty, 0);
  }

  function totalQty(items) {
    return items.reduce((s, x) => s + x.qty, 0);
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      els.toast.hidden = true;
    }, 2200);
  }

  function openDrawer() {
    if (!els.drawer) return;
    els.drawer.hidden = false;
    if (els.backdrop) els.backdrop.hidden = false;
    els.drawer.setAttribute("aria-hidden", "false");
    if (els.toggle) els.toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("cart-open");
  }

  function closeDrawer() {
    if (!els.drawer) return;
    els.drawer.hidden = true;
    if (els.backdrop) els.backdrop.hidden = true;
    els.drawer.setAttribute("aria-hidden", "true");
    if (els.toggle) els.toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("cart-open");
    try {
      if (els.toggle && typeof els.toggle.focus === "function") els.toggle.focus();
    } catch (_) {}
  }

  function render() {
    const items = getCart();
    const sum = subtotal(items);
    const qty = totalQty(items);

    if (els.badge) {
      els.badge.textContent = String(qty);
      els.badge.hidden = qty === 0;
    }
    if (els.subtotal) els.subtotal.textContent = formatMoney(sum);
    if (els.countSummary) els.countSummary.textContent = String(qty);
    if (els.empty) els.empty.hidden = items.length > 0;
    if (els.lines) {
      els.lines.innerHTML = "";
      items.forEach(function (line) {
        const li = document.createElement("li");
        li.className = "cart-line";
        li.dataset.id = line.id;
        li.innerHTML =
          '<img class="cart-line-img" src="' +
          escapeAttr(line.image) +
          '" alt="' +
          escapeAttr(line.name) +
          '">' +
          '<div class="cart-line-body">' +
          '<p class="cart-line-name">' +
          escapeHtml(line.name) +
          "</p>" +
          '<p class="cart-line-priceunit">' +
          formatMoney(line.price) +
          " / sp</p>" +
          '<div class="cart-line-controls">' +
          '<div class="qty-stepper">' +
          '<button type="button" class="qty-btn" data-action="dec" aria-label="Giảm số lượng">−</button>' +
          '<span class="qty-val">' +
          line.qty +
          "</span>" +
          '<button type="button" class="qty-btn" data-action="inc" aria-label="Tăng số lượng">+</button>' +
          "</div>" +
          '<span class="cart-line-sub">' +
          formatMoney(line.price * line.qty) +
          "</span>" +
          "</div>" +
          "</div>" +
          '<button type="button" class="cart-line-remove" data-action="remove" aria-label="Xóa khỏi giỏ">×</button>';
        els.lines.appendChild(li);
      });
    }
    if (els.checkout) els.checkout.disabled = items.length === 0;
    if (els.clear) els.clear.disabled = items.length === 0;
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

  function readCard(card) {
    return {
      id: card.dataset.id || "",
      name: card.dataset.name || "",
      price: parseInt(card.dataset.price || "0", 10) || 0,
      image: card.dataset.image || "",
    };
  }

  function buildMailBody(items) {
    const lines = items.map(function (x, i) {
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
    lines.push("", "Tạm tính: " + formatMoney(subtotal(items)));
    lines.push("", "— Đơn đặt từ TripleT Cầu Lông —");
    return lines.join("\n");
  }

  function init() {
    els.backdrop = document.getElementById("cart-backdrop");
    els.drawer = document.getElementById("cart-drawer");
    els.toggle = document.getElementById("cart-toggle");
    els.close = document.getElementById("cart-close");
    els.badge = document.getElementById("cart-badge");
    els.empty = document.getElementById("cart-empty");
    els.lines = document.getElementById("cart-lines");
    els.subtotal = document.getElementById("cart-subtotal");
    els.checkout = document.getElementById("cart-checkout");
    els.clear = document.getElementById("cart-clear");
    els.countSummary = document.getElementById("cart-count-summary");
    els.toast = document.getElementById("cart-toast");

    if (!els.drawer) return;

    render();

    document.addEventListener("click", function (e) {
      const btn = e.target && e.target.closest && e.target.closest("[data-add-cart]");
      if (!btn) return;
      const card = btn.closest(".product-card");
      if (!card) return;
      const p = readCard(card);
      if (!p.id) return;
      addProduct(p);
      showToast("Đã thêm vào giỏ hàng");
    });

    if (els.toggle) {
      els.toggle.addEventListener("click", function () {
        if (els.drawer.hidden) openDrawer();
        else closeDrawer();
      });
    }

    /* Đóng: delegation — xử lý cả khi target là text node bên trong nút × */
    if (els.drawer) {
      els.drawer.addEventListener("click", function (e) {
        var t = e.target;
        var el = t instanceof Element ? t : t && t.parentElement;
        if (!el || !(el instanceof Element)) return;
        if (!el.closest("#cart-close")) return;
        e.preventDefault();
        e.stopPropagation();
        closeDrawer();
      });
    }
    if (els.close) {
      els.close.addEventListener("click", function (e) {
        e.preventDefault();
        closeDrawer();
      });
    }
    if (els.backdrop) els.backdrop.addEventListener("click", closeDrawer);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.drawer && !els.drawer.hidden) closeDrawer();
    });

    if (els.lines) {
      els.lines.addEventListener("click", function (e) {
        const t = e.target;
        if (!(t instanceof Element)) return;
        const line = t.closest(".cart-line");
        if (!line) return;
        const id = line.dataset.id;
        if (!id) return;
        const item = getCart().find((x) => x.id === id);
        if (!item) return;

        const rm = t.closest("[data-action='remove']");
        if (rm) {
          removeLine(id);
          return;
        }
        const act = t.closest("[data-action]");
        if (!act) return;
        const action = act.getAttribute("data-action");
        if (action === "inc") setQty(id, item.qty + 1);
        else if (action === "dec") setQty(id, item.qty - 1);
      });
    }

    if (els.clear) {
      els.clear.addEventListener("click", function () {
        if (getCart().length === 0) return;
        if (confirm("Xóa toàn bộ sản phẩm trong giỏ?")) setCart([]);
      });
    }

    if (els.checkout) {
      els.checkout.addEventListener("click", function () {
        const items = getCart();
        if (!items.length) return;
        const body = encodeURIComponent(buildMailBody(items));
        const subject = encodeURIComponent("[TripleT] Đặt hàng từ giỏ");
        window.location.href =
          "mailto:TripelTteam@gmail.com?subject=" + subject + "&body=" + body;
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
