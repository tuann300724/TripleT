(function () {
  "use strict";

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

  function renderCard(p) {
    var thumb = p.thumb || p.image;
    var alt = p.alt || p.name;
    return (
      '<article class="product-card" data-id="' +
      escapeAttr(p.id) +
      '" data-name="' +
      escapeAttr(p.name) +
      '" data-price="' +
      p.price +
      '" data-image="' +
      escapeAttr(thumb) +
      '">' +
      '<div class="product-img">' +
      '<img src="../' +
      escapeAttr(p.image) +
      '" alt="' +
      escapeAttr(alt) +
      '" width="600" height="600" loading="lazy">' +
      "</div>" +
      '<div class="product-body">' +
      '<span class="product-tag">' +
      escapeHtml(p.tag) +
      "</span>" +
      "<h3>" +
      escapeHtml(p.name) +
      "</h3>" +
      '<p class="product-price">' +
      formatPrice(p.price) +
      "</p>" +
      '<button type="button" class="btn btn-primary" data-add-cart>Thêm vào giỏ</button>' +
      "</div></article>"
    );
  }

  function init() {
    var root = document.getElementById("catalog-root");
    if (!root || !window.TRIPLET_PRODUCTS) return;

    var mode = root.getAttribute("data-mode") || "";
    var category = root.getAttribute("data-category") || "";

    if (category) {
      var filtered = TRIPLET_PRODUCTS.filter(function (x) {
        return x.category === category;
      });
      root.innerHTML =
        '<div class="products">' +
        filtered.map(renderCard).join("") +
        "</div>";
      return;
    }

    if (mode === "featured") {
      var feat = TRIPLET_PRODUCTS.filter(function (x) {
        return x.featured;
      });
      root.innerHTML =
        '<div class="products">' +
        feat.map(renderCard).join("") +
        "</div>";
      return;
    }

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
            '<section class="section catalog-section" id="cat-' +
            key +
            '">' +
            '<div class="section-head"><div><h2>' +
            escapeHtml(m.title) +
            "</h2><p>" +
            escapeHtml(m.blurb) +
            "</p></div>" +
            '<a href="danh-muc-' +
            key +
            '.html" class="link-muted">Chỉ xem danh mục này →</a></div>' +
            '<div class="products">' +
            items.map(renderCard).join("") +
            "</div></section>"
          );
        })
        .join("");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();

(function () {
  "use strict";

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

  function renderCard(p) {
    var thumb = p.thumb || p.image;
    var alt = p.alt || p.name;
    return (
      '<article class="product-card" data-id="' +
      escapeAttr(p.id) +
      '" data-name="' +
      escapeAttr(p.name) +
      '" data-price="' +
      p.price +
      '" data-image="' +
      escapeAttr(thumb) +
      '">' +
      '<div class="product-img">' +
      '<img src="../' +
      escapeAttr(p.image) +
      '" alt="' +
      escapeAttr(alt) +
      '" width="600" height="600" loading="lazy">' +
      "</div>" +
      '<div class="product-body">' +
      '<span class="product-tag">' +
      escapeHtml(p.tag) +
      "</span>" +
      "<h3>" +
      escapeHtml(p.name) +
      "</h3>" +
      '<p class="product-price">' +
      formatPrice(p.price) +
      "</p>" +
      '<button type="button" class="btn btn-primary" data-add-cart>Thêm vào giỏ</button>' +
      "</div></article>"
    );
  }

  function init() {
    var root = document.getElementById("catalog-root");
    if (!root || !window.TRIPLET_PRODUCTS) return;

    var mode = root.getAttribute("data-mode") || "";
    var category = root.getAttribute("data-category") || "";

    if (category) {
      var filtered = TRIPLET_PRODUCTS.filter(function (x) {
        return x.category === category;
      });
      root.innerHTML =
        '<div class="products">' +
        filtered.map(renderCard).join("") +
        "</div>";
      return;
    }

    if (mode === "featured") {
      var feat = TRIPLET_PRODUCTS.filter(function (x) {
        return x.featured;
      });
      root.innerHTML =
        '<div class="products">' +
        feat.map(renderCard).join("") +
        "</div>";
      return;
    }

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
            '<section class="section catalog-section" id="cat-' +
            key +
            '">' +
            '<div class="section-head"><div><h2>' +
            escapeHtml(m.title) +
            "</h2><p>" +
            escapeHtml(m.blurb) +
            "</p></div>" +
            '<a href="danh-muc-' +
            key +
            '.html" class="link-muted">Chỉ xem danh mục này →</a></div>' +
            '<div class="products">' +
            items.map(renderCard).join("") +
            "</div></section>"
          );
        })
        .join("");
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
