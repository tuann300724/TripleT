
document.addEventListener("DOMContentLoaded", function () {
    // 1. Lấy ID từ URL (ví dụ: ?id=v01)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    // 2. Kiểm tra nếu có dữ liệu sản phẩm (Yêu cầu phải có file products-data.js)
    if (!productId || !window.TRIPLET_PRODUCTS) {
        alert("Không tìm thấy thông tin sản phẩm!");
        return;
    }

    // 3. Tìm sản phẩm trong danh sách
    const product = window.TRIPLET_PRODUCTS.find((p) => p.id === productId);

    if (product) {
        // 4. Cập nhật tiêu đề trang
        document.title = "TripleT - " + product.name;

        // 5. Đổ dữ liệu vào các thẻ HTML
        document.getElementById("product-name").innerText = product.name;
        document.getElementById("product-img").src = "../" + product.image;
        document.getElementById("product-img").alt = product.name;
        document.getElementById("product-tag").innerText =
            product.tag || "Sản phẩm mới";

        // Định dạng giá tiền
        const priceVnd =
            new Intl.NumberFormat("vi-VN").format(product.price) + "₫";
        document.getElementById("product-price").innerText = priceVnd;

        // Tính giá cũ (ví dụ tự tăng 15% để làm giá ảo nếu không có trong data)
        const oldPrice = product.oldPrice || product.price * 1.15;
        document.getElementById("product-old-price").innerText =
            new Intl.NumberFormat("vi-VN").format(oldPrice) + "₫";

        // Mô tả (nếu có trong data)
        if (product.desc) {
            document.getElementById("product-desc").innerText = product.desc;
        }

        // Cập nhật bảng thông số (Nếu dữ liệu có phần specs)
        if (product.specs) {
            const specsTable = document.querySelector(".specs-table");
            // Bạn có thể viết code để loop qua object specs và tạo dòng <tr>
        }

        // Logic 3 tính năng mới: Custom Vợt, Size Guide, Video Review
        if (product.category === "vot") {
            const racketOpts = document.getElementById("custom-racket-options");
            if (racketOpts) racketOpts.style.display = "block";

            const stringTypeEl = document.getElementById("string-type");
            const stringTensionEl = document.getElementById("string-tension");
            if (stringTypeEl && stringTensionEl) {
                stringTypeEl.addEventListener("change", function() {
                    if (this.value === "none") {
                        stringTensionEl.disabled = true;
                        stringTensionEl.value = "";
                    } else {
                        stringTensionEl.disabled = false;
                    }
                });
            }

            const tabVideo = document.getElementById("tab-video");
            if (tabVideo) tabVideo.style.display = "block";
            
            const videoId = "S1x76l3m-G8";
            const videoContainer = document.getElementById("video-container");
            if(videoContainer) {
                videoContainer.innerHTML = `<iframe style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
            }
        }

        if (product.category === "giay-ao") {
            const sizeBtn = document.getElementById("btn-size-guide");
            if (sizeBtn) {
                sizeBtn.style.display = "inline-block";
                sizeBtn.onclick = function() {
                    document.getElementById('size-guide-modal').style.display = 'block';
                };
            }
        }

    } else {
        document.querySelector("main").innerHTML =
            "<h2 style='text-align:center; padding:100px;'>Sản phẩm không tồn tại!</h2>";
    }
});

// Thay đổi số lượng
function changeQty(n) {
    let input = document.getElementById("qty");
    let val = parseInt(input.value) + n;
    if (val >= 1 && val <= 10) input.value = val;
}

// Chọn phiên bản
function selectVariant(el) {
    document
        .querySelectorAll(".opt")
        .forEach((o) => o.classList.remove("selected"));
    el.classList.add("selected");
}

// Chuyển Tab
function switchTab(el, id) {
    document
        .querySelectorAll(".tab-item")
        .forEach((t) => t.classList.remove("active"));
    el.classList.add("active");

    document
        .querySelectorAll(".tab-pane")
        .forEach((p) => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// Thêm sản phẩm vào giỏ hàng thực tế (dùng cart.js)
function handleAddToCart() {
    const qty = parseInt(document.getElementById("qty").value);
    // Lấy ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId || !window.TRIPLET_PRODUCTS) return;
    const product = window.TRIPLET_PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    // Lấy thông tin căng cước nếu có
    let stringTypeStr = "none";
    let stringTensionStr = "";
    let extraPrice = 0;
    let customMeta = "";

    const stringTypeEl = document.getElementById("string-type");
    const stringTensionEl = document.getElementById("string-tension");
    if (stringTypeEl) stringTypeStr = stringTypeEl.value;
    if (stringTensionEl) stringTensionStr = stringTensionEl.value;

    if (product.category === "vot" && stringTypeStr !== "none") {
        if (!stringTensionStr) {
            alert("Vui lòng chọn mức căng (Số kg) cho loại cước bạn đã chọn!");
            return;
        }
        const strOpt = document.querySelector(`#string-type option[value="${stringTypeStr}"]`);
        extraPrice = parseInt(strOpt.getAttribute("data-price") || "0");
        customMeta = ` (Cước: ${strOpt.text.split('(')[0].trim()}, Căng: ${stringTensionStr}kg)`;
    }

    // Tạo object sản phẩm cho cart.js
    const finalProduct = {
        id: product.id + (customMeta ? '-' + stringTypeStr : ''),
        name: product.name + customMeta,
        price: product.price + extraPrice,
        image: product.image,
        qty: 1
    };

    // Tạo object sản phẩm cho cart.js
    for (let i = 0; i < qty; i++) {
        if (window.addProductToCart) {
            window.addProductToCart(finalProduct);
        } else if (window.localStorage) {
            // fallback nếu cart.js chưa load
            let items = [];
            try {
                items = JSON.parse(localStorage.getItem("triplet_cart_v1")) || [];
            } catch { }
            const idx = items.findIndex(x => x.id === finalProduct.id);
            if (idx >= 0) items[idx].qty += 1;
            else items.push(finalProduct);
            localStorage.setItem("triplet_cart_v1", JSON.stringify(items));
        }
    }
    // Gọi lại render() của cart.js để cập nhật ngay danh sách sản phẩm trong giỏ hàng
    if (window.cartRender) {
        window.cartRender();
    } else if (window.document && window.document.getElementById) {
        // Tự động cập nhật badge nếu cart.js chưa có hàm render toàn cục
        const badge = document.getElementById("cart-badge");
        if (badge) {
            let items = [];
            try {
                items = JSON.parse(localStorage.getItem("triplet_cart_v1")) || [];
            } catch { }
            const totalQty = items.reduce((s, x) => s + (x.qty || 0), 0);
            badge.textContent = totalQty;
            badge.hidden = totalQty === 0;
        }
        // Cập nhật luôn danh sách sản phẩm trong drawer nếu có
        const lines = document.getElementById("cart-lines");
        if (lines) {
            let items = [];
            try {
                items = JSON.parse(localStorage.getItem("triplet_cart_v1")) || [];
            } catch { }
            lines.innerHTML = "";
            items.forEach(function (line) {
                const li = document.createElement("li");
                li.className = "cart-line";
                li.dataset.id = line.id;
                li.innerHTML =
                    '<img class="cart-line-img" src="../' +
                    line.image +
                    '" alt="' +
                    line.name +
                    '">' +
                    '<div class="cart-line-body">' +
                    '<p class="cart-line-name">' +
                    line.name +
                    "</p>" +
                    '<p class="cart-line-priceunit">' +
                    (new Intl.NumberFormat("vi-VN").format(line.price) + "₫") +
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
                    (new Intl.NumberFormat("vi-VN").format(line.price * line.qty) + "₫") +
                    "</span>" +
                    "</div>" +
                    "</div>" +
                    '<button type="button" class="cart-line-remove" data-action="remove" aria-label="Xóa khỏi giỏ">×</button>';
                lines.appendChild(li);
            });
            // Ẩn/hiện thông báo giỏ rỗng
            const empty = document.getElementById("cart-empty");
            if (empty) empty.hidden = items.length > 0;
            // Cập nhật tổng số lượng và tổng tiền
            const subtotal = document.getElementById("cart-subtotal");
            if (subtotal) subtotal.textContent = (new Intl.NumberFormat("vi-VN").format(items.reduce((s, x) => s + x.price * x.qty, 0)) + "₫");
            const countSummary = document.getElementById("cart-count-summary");
            if (countSummary) countSummary.textContent = items.reduce((s, x) => s + (x.qty || 0), 0);
            const checkout = document.getElementById("cart-checkout");
            if (checkout) checkout.disabled = items.length === 0;
            const clear = document.getElementById("cart-clear");
            if (clear) clear.disabled = items.length === 0;
        }
    }
    // Hiển thị toast
    const toast = document.getElementById("cart-toast") || document.getElementById("toast-msg");
    if (toast) {
        toast.textContent = "Đã thêm vào giỏ hàng";
        toast.classList.add("show");
        toast.hidden = false;
        setTimeout(() => {
            toast.classList.remove("show");
            toast.hidden = true;
        }, 2200);
    }
}

// Khởi tạo Review System
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) return;

    let selectedRating = 0;
    const stars = document.querySelectorAll("#review-stars-input i");
    const nameInput = document.getElementById("review-name");
    const textInput = document.getElementById("review-text");
    const submitBtn = document.getElementById("submit-review");
    const reviewList = document.getElementById("review-list");

    if(!stars.length || !submitBtn || !reviewList) return; // Nút review list không tồn tại trên trang

    // Tương tác khi Hover/Click sao đỏ
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            let val = parseInt(this.getAttribute('data-rating'));
            stars.forEach(s => {
                if(parseInt(s.getAttribute('data-rating')) <= val) {
                    s.style.color = '#ffb800';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });

        star.addEventListener('mouseout', function() {
            stars.forEach(s => {
                if(parseInt(s.getAttribute('data-rating')) <= selectedRating) {
                    s.style.color = '#ffb800';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });

        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            // Cập nhật class
            stars.forEach(s => {
                if(parseInt(s.getAttribute('data-rating')) <= selectedRating) {
                    s.style.color = '#ffb800';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });

    function getReviews() {
        try {
            const data = localStorage.getItem('triplet_reviews_' + productId);
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    }

    function saveReview(name, text, rating) {
        const reviews = getReviews();
        reviews.unshift({ // Push lên đầu
            name: name,
            text: text,
            rating: rating,
            date: new Date().toLocaleDateString('vi-VN')
        });
        localStorage.setItem('triplet_reviews_' + productId, JSON.stringify(reviews));
    }

    function generateStars(rating) {
        let h = '';
        for(let i=1; i<=5; i++) {
            h += `<i class="fa-solid fa-star" style="color: ${i <= rating ? '#ffb800' : '#ddd'}; font-size: 13px;"></i>`;
        }
        return h;
    }

    function renderReviews() {
        const reviews = getReviews();
        if(reviews.length === 0) {
            reviewList.innerHTML = `<p style="text-align: center; color: #999;">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>`;
            return;
        }

        reviewList.innerHTML = reviews.map(r => `
            <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <strong style="font-size: 15px;">${r.name.replace(/</g, "&lt;")}</strong>
                    <span style="font-size: 12px; color: #999;">${r.date}</span>
                </div>
                <div style="margin-bottom: 8px;">
                    ${generateStars(r.rating)}
                </div>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #444;">
                    ${r.text.replace(/</g, "&lt;").replace(/\\n/g, '<br>')}
                </p>
            </div>
        `).join('');
    }

    submitBtn.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        
        if(!name) { alert("Vui lòng nhập tên của bạn!"); return; }
        if(selectedRating === 0) { alert("Vui lòng chọn số sao đánh giá!"); return; }
        if(!text) { alert("Vui lòng nhập nội dung đánh giá!"); return; }

        saveReview(name, text, selectedRating);
        
        // Reset form
        nameInput.value = '';
        textInput.value = '';
        selectedRating = 0;
        stars.forEach(s => s.style.color = '#ddd');

        renderReviews();
    });

    // Render list lần đầu
    renderReviews();
});
