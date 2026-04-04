(function () {
  "use strict";

  // 1. Các hàm hỗ trợ (Utility)
  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function formatPrice(n) {
    return new Intl.NumberFormat("vi-VN").format(n) + "₫";
  }

  // 2. Hàm tạo thẻ sản phẩm (Render Card)
  function renderCard(p) {
    var thumb = p.thumb || p.image;
    var alt = p.alt || p.name;
    var detailUrl = "chi-tiet-san-pham.html?id=" + encodeURIComponent(p.id);

    return (
      '<article class="product-card" data-id="' + escapeAttr(p.id) + '">' +
        '<div class="product-img">' +
          '<img src="../' + escapeAttr(p.image) + '" alt="' + escapeAttr(alt) + '" width="600" height="600" loading="lazy">' +
        '</div>' +

        '<div class="product-body">' +
          '<span class="product-tag">' + escapeHtml(p.tag) + '</span>' +
          '<h3>' + escapeHtml(p.name) + '</h3>' +
          '<p class="product-price">' + formatPrice(p.price) + '</p>' +

          /* CỤM NÚT BẤM */
          '<div class="product-actions" style="display: flex; gap: 8px; margin-top: 12px;">' +
            // Nút Xem chi tiết (Dùng thẻ a giả nút bấm)
            '<a href="' + detailUrl + '" style="flex: 1; text-align: center; text-decoration: none; padding: 10px 5px; border: 1.5px solid #2D8A68; color: #2D8A68; border-radius: 8px; font-size: 13px; font-weight: 700; transition: 0.3s;">' +
              'Chi tiết' +
            '</a>' +
            // Nút Thêm vào giỏ
            '<button type="button" class="btn btn-primary" data-add-cart style="flex: 1; padding: 10px 5px; border-radius: 8px; font-size: 13px; font-weight: 700; background: #2D8A68; color: white; border: none; cursor: pointer;">' +
              'Thêm giỏ' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  // 3. Hàm khởi tạo (Logic hiển thị)
  function init() {
    var root = document.getElementById("catalog-root");
    if (!root || !window.TRIPLET_PRODUCTS) return;

    var mode = root.getAttribute("data-mode") || "";
    var category = root.getAttribute("data-category") || "";

    // Lọc theo danh mục (Ví dụ: Trang vợt, trang cầu)
    if (category) {
      var filtered = TRIPLET_PRODUCTS.filter(function (x) {
        return x.category === category;
      });
      root.innerHTML = '<div class="products">' + filtered.map(renderCard).join("") + '</div>';
      return;
    }

    // Hiển thị sản phẩm nổi bật (Trang chủ)
    if (mode === "featured") {
      var feat = TRIPLET_PRODUCTS.filter(function (x) {
        return x.featured;
      });
      root.innerHTML = '<div class="products">' + feat.map(renderCard).join("") + '</div>';
      return;
    }

    // Hiển thị tất cả chia theo từng phần (Trang tất cả sản phẩm)
    if (mode === "full") {
      var order = ["vot", "cau", "giay-ao", "tui-phu-kien"];
      var meta = window.TRIPLET_CATEGORY_META || {};
      var byCat = {};
      
      TRIPLET_PRODUCTS.forEach(function (p) {
        if (!byCat[p.category]) byCat[p.category] = [];
        byCat[p.category].push(p);
      });

      root.innerHTML = order
        .map(function (key) {
          var items = byCat[key];
          if (!items || !items.length) return "";
          var m = meta[key] || { title: key, blurb: "" };
          return (
            '<section class="section catalog-section" id="cat-' + key + '">' +
              '<div class="section-head">' +
                '<div><h2>' + escapeHtml(m.title) + '</h2><p>' + escapeHtml(m.blurb) + '</p></div>' +
                '<a href="danh-muc-' + key + '.html" class="link-muted">Chỉ xem danh mục này →</a>' +
              '</div>' +
              '<div class="products">' + items.map(renderCard).join("") + '</div>' +
            '</section>'
          );
        })
        .join("");
    }
  }

  // 4. Lắng nghe sự kiện load trang
  document.addEventListener("DOMContentLoaded", init);
})();