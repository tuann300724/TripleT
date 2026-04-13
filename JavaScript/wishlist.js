(function () {
    "use strict";

    // 1. Inject CSS for Wishlist
    const styleString = `
        /* Heart icon on product cards */
        .btn-wishlist {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.9) !important;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 18px;
            color: #999;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            transition: all 0.2s;
            z-index: 10;
        }
        .btn-wishlist:hover {
            color: #e3000f;
            transform: scale(1.1);
        }
        .btn-wishlist.active {
            color: #e3000f;
        }

        /* Nav Icon */
        .wishlist-toggle {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            position: relative;
            margin-right: 15px;
            color: #333;
        }
        .wishlist-badge {
            position: absolute;
            top: -5px;
            right: -8px;
            background-color: #e3000f;
            color: white;
            font-size: 11px;
            font-weight: bold;
            padding: 2px 5px;
            border-radius: 10px;
        }

        /* Wishlist Drawer */
        .wishlist-drawer {
            position: fixed;
            top: 0;
            right: -400px;
            width: 100%;
            max-width: 380px;
            height: 100vh;
            background: #fff;
            box-shadow: -5px 0 15px rgba(0,0,0,0.1);
            z-index: 2000;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
        }
        .wishlist-drawer.open {
            right: 0;
        }
        
        .wishlist-drawer-head {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .wishlist-drawer-head h2 {
            margin: 0;
            font-size: 20px;
            color: #e3000f;
        }
        .wishlist-close {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #999;
        }
        
        .wishlist-drawer-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }
        
        .wishlist-item {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 15px;
            position: relative;
        }
        .wishlist-item-img {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #eee;
        }
        .wishlist-item-info {
            flex: 1;
        }
        .wishlist-item-title {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 5px 0;
            line-height: 1.3;
        }
        .wishlist-item-price {
            color: #e3000f;
            font-weight: bold;
            font-size: 14px;
        }
        .wishlist-remove {
            position: absolute;
            right: 0;
            top: 0;
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
        }
        .wishlist-remove:hover {
            color: #e3000f;
        }
        .wishlist-empty {
            text-align: center;
            color: #666;
            margin-top: 50px;
        }
        .cart-backdrop.wishlist-active {
            display: block !important;
            opacity: 1 !important;
        }
    `;
    const style = document.createElement('style');
    style.innerHTML = styleString;
    document.head.appendChild(style);

    // 2. Inject HTML for Wishlist Toggle into Header
    function injectHeaderIcon() {
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'wishlist-toggle';
            wishlistBtn.id = 'wishlist-toggle';
            wishlistBtn.innerHTML = `
                <i class="fa-solid fa-heart"></i>
                <span class="wishlist-badge" id="wishlist-badge" hidden>0</span>
            `;
            // Insert before cart toggle or login btn
            const cartToggle = document.getElementById('cart-toggle');
            if (cartToggle) {
                headerActions.insertBefore(wishlistBtn, cartToggle);
            } else {
                headerActions.prepend(wishlistBtn);
            }
        }
    }

    // 3. Inject Wishlist Drawer HTML
    function injectDrawer() {
        const drawer = document.createElement('aside');
        drawer.className = 'wishlist-drawer';
        drawer.id = 'wishlist-drawer';
        drawer.innerHTML = `
            <div class="wishlist-drawer-head">
                <h2>Yêu thích</h2>
                <button type="button" class="wishlist-close" id="wishlist-close">×</button>
            </div>
            <div class="wishlist-drawer-body">
                <div class="wishlist-empty" id="wishlist-empty">
                    Bạn chưa có sản phẩm yêu thích nào.
                </div>
                <div id="wishlist-lines"></div>
            </div>
        `;
        document.body.appendChild(drawer);
    }

    // 4. Data Management
    let wishlistItems = [];

    function loadWishlist() {
        try {
            const data = localStorage.getItem('triplet_wishlist');
            wishlistItems = data ? JSON.parse(data) : [];
        } catch (e) {
            wishlistItems = [];
        }
    }

    function saveWishlist() {
        localStorage.setItem('triplet_wishlist', JSON.stringify(wishlistItems));
    }

    function toggleWishlistItem(product) {
        const index = wishlistItems.findIndex(item => item.id === product.id);
        if (index > -1) {
            wishlistItems.splice(index, 1);
        } else {
            wishlistItems.push(product);
        }
        saveWishlist();
        updateUI();
    }

    function formatPrice(n) {
        return new Intl.NumberFormat("vi-VN").format(n) + "₫";
    }

    function renderWishlistDrawer() {
        const linesContainer = document.getElementById('wishlist-lines');
        const emptyState = document.getElementById('wishlist-empty');
        const badge = document.getElementById('wishlist-badge');

        if (!linesContainer || !emptyState || !badge) return;

        if (wishlistItems.length === 0) {
            emptyState.style.display = 'block';
            linesContainer.innerHTML = '';
            badge.hidden = true;
        } else {
            emptyState.style.display = 'none';
            badge.hidden = false;
            badge.textContent = wishlistItems.length;
            
            linesContainer.innerHTML = wishlistItems.map(item => `
                <div class="wishlist-item" data-id="${item.id}">
                    <img src="../${item.image}" alt="${item.name}" class="wishlist-item-img">
                    <div class="wishlist-item-info">
                        <p class="wishlist-item-title">${item.name}</p>
                        <p class="wishlist-item-price">${formatPrice(item.price)}</p>
                        <a href="chi-tiet-san-pham.html?id=${item.id}" style="font-size: 12px; color: #f0a500; text-decoration: none;">Xem chi tiết</a>
                    </div>
                    <button class="wishlist-remove" data-id="${item.id}" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('');
            
            // Add Remove Events
            const removeBtns = linesContainer.querySelectorAll('.wishlist-remove');
            removeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    wishlistItems = wishlistItems.filter(i => i.id !== id);
                    saveWishlist();
                    updateUI();
                });
            });
        }
    }

    function updateHeartIcons() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            // Check if heart icon already exists
            let heartBtn = card.querySelector('.btn-wishlist');
            if (!heartBtn) {
                // Determine position inside product-img
                const imgContainer = card.querySelector('.product-img') || card;
                imgContainer.style.position = 'relative';
                
                heartBtn = document.createElement('button');
                heartBtn.className = 'btn-wishlist';
                heartBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
                imgContainer.appendChild(heartBtn);

                heartBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // In case card is an 'a' tag
                    e.stopPropagation();
                    
                    const id = card.getAttribute('data-id');
                    const name = card.getAttribute('data-name');
                    const price = parseFloat(card.getAttribute('data-price') || "0");
                    const image = card.getAttribute('data-image') || "Images/default.jpg";
                    
                    if(id) {
                        toggleWishlistItem({id, name, price, image});
                    }
                });
            }

            const id = card.getAttribute('data-id');
            const isInWishlist = wishlistItems.some(i => i.id === id);
            
            if (isInWishlist) {
                heartBtn.classList.add('active');
            } else {
                heartBtn.classList.remove('active');
            }
        });
    }

    function updateUI() {
        renderWishlistDrawer();
        updateHeartIcons();
    }

    // 5. Drawer Controller
    function setupDrawerEvents() {
        const toggleBtn = document.getElementById('wishlist-toggle');
        const closeBtn = document.getElementById('wishlist-close');
        const drawer = document.getElementById('wishlist-drawer');
        const backdrop = document.getElementById('cart-backdrop'); // Reuse existing backdrop

        if (!drawer || !toggleBtn) return;

        function openDrawer() {
            drawer.classList.add('open');
            if(backdrop) backdrop.classList.add('wishlist-active');
            if(backdrop) backdrop.hidden = false;
        }

        function closeDrawer() {
            drawer.classList.remove('open');
            if(backdrop) backdrop.classList.remove('wishlist-active');
            
            // Check if cart is also open before hiding backdrop
            const cartDrawer = document.getElementById('cart-drawer');
            if (cartDrawer && !cartDrawer.hidden && !cartDrawer.classList.contains('closed')) {
                // Leave it
            } else {
                setTimeout(() => { if(backdrop) backdrop.hidden = true; }, 300);
            }
        }

        toggleBtn.addEventListener('click', openDrawer);
        if(closeBtn) closeBtn.addEventListener('click', closeDrawer);
        
        if (backdrop) {
            backdrop.addEventListener('click', (e) => {
                if (drawer.classList.contains('open')) {
                    closeDrawer();
                }
            });
        }
    }

    // Initialize System
    document.addEventListener('DOMContentLoaded', () => {
        injectHeaderIcon();
        injectDrawer();
        loadWishlist();
        setupDrawerEvents();
        updateUI();

        // Mutation Observer to attach heart icons to dynamically added product cards
        const observer = new MutationObserver(() => {
            updateHeartIcons();
        });
        
        const catalogRoot = document.getElementById('catalog-root');
        if (catalogRoot) {
            observer.observe(catalogRoot, { childList: true, subtree: true });
        }
    });

})();
