
// Hiển thị thông tin user từ localStorage
document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('tripleT_currentUser'));
    if (user) {
        document.getElementById('user-fullname').textContent = user.name || '—';
        // Nếu username là số điện thoại thì hiển thị, nếu là email thì hiển thị đúng trường
        const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
        if (phoneRegex.test(user.username)) {
            document.getElementById('user-phone').textContent = user.username;
            document.getElementById('user-email').textContent = user.email || '—';
        } else {
            document.getElementById('user-email').textContent = user.username;
            document.getElementById('user-phone').textContent = user.phone || '—';
        }
    }

    // Hiển thị đơn hàng của user
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersList = document.getElementById('orders-list');
    if (!user || (!user.id && !user.username)) {
        ordersList.innerHTML = '<p style="color:#888">Bạn chưa đăng nhập hoặc chưa có đơn hàng nào.</p>';
        return;
    }
    const userOrders = orders.filter(o => o.iduser === user.id || o.iduser === user.username);
    if (userOrders.length === 0) {
        ordersList.innerHTML = '<p style="color:#888">Chưa có đơn hàng nào.</p>';
        return;
    }
    // Hiển thị từng đơn hàng (chỉ đơn gần nhất hoặc tất cả)
    ordersList.innerHTML = userOrders.reverse().map(order => {
        // Lấy sản phẩm đầu tiên để làm đại diện
        const firstItem = order.items[0];
        const img = firstItem && firstItem.image ? firstItem.image : 'https://via.placeholder.com/80';
        const name = firstItem ? firstItem.name : '';
        const qty = firstItem ? firstItem.qty : '';
        const price = firstItem ? firstItem.price : '';
        const oldPrice = firstItem && firstItem.oldPrice ? `<span class="old">${firstItem.oldPrice.toLocaleString()}đ</span>` : '';
        const total = order.total ? order.total.toLocaleString() + 'đ' : '';
        const customer = order.customer || {};
        return `
                    <div class="order-item">
                        <div class="order-top">
                            <span class="order-code">Mã đơn: ${order.id}</span>
                        </div>
                        <div style="font-size:13px;color:#666;margin:8px 0 0 0;line-height:1.7;">
                            <div><strong>Khách hàng:</strong> ${customer.name || ''}</div>
                            <div><strong>Điện thoại:</strong> ${customer.phone || ''}</div>
                            <div><strong>Email:</strong> ${customer.email || ''}</div>
                            <div><strong>Địa chỉ:</strong> ${customer.address || ''}</div>
                        </div>
                        <div class="order-mid">
                            <img src="../${img}" alt="Product" class="p-img" />
                            <div class="p-info">
                                <h4>${name}</h4>
                                <p>x${qty}</p>
                            </div>
                            <div class="p-price">
                                ${oldPrice}
                                <span class="current">${price.toLocaleString()}đ</span>
                            </div>
                        </div>
                        <div class="order-bottom">
                            <div class="total-area">
                                Tổng số tiền: <strong>${total}</strong>
                            </div>
                        </div>
                    </div>
                    `;
    }).join('');
    // PHÂN TRANG nếu đơn hàng nhiều
    const ORDERS_PER_PAGE = 3;
    let currentPage = 1;
    function renderOrdersPage(page) {
        const start = (page - 1) * ORDERS_PER_PAGE;
        const end = start + ORDERS_PER_PAGE;
        const pagedOrders = userOrders.slice().reverse().slice(start, end);
        ordersList.innerHTML = pagedOrders.map(order => {
            const customer = order.customer || {};
            const total = order.total ? order.total.toLocaleString() + 'đ' : '';
            // Hiển thị tất cả item trong đơn
            const itemsHtml = (order.items || []).map(item => {
                const img = item.image ? item.image : 'https://via.placeholder.com/80';
                const name = item.name || '';
                const qty = item.qty || '';
                const price = item.price || '';
                const oldPrice = item.oldPrice ? `<span class="old">${item.oldPrice.toLocaleString()}đ</span>` : '';
                return `
                                <div class="order-mid" style="border-bottom:1px dashed #eee;padding-bottom:10px;margin-bottom:10px;display:flex;align-items:center;gap:20px;">
                                    <img src="../${img}" alt="Product" class="p-img" />
                                    <div class="p-info">
                                        <h4>${name}</h4>
                                        <p>x${qty}</p>
                                    </div>
                                    <div class="p-price">
                                        ${oldPrice}
                                        <span class="current">${price.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            `;
            }).join('');
            return `
                        <div class="order-item">
                            <div class="order-top">
                                <span class="order-code">Mã đơn: ${order.id}</span>
                            </div>
                            <div style="font-size:13px;color:#666;margin:8px 0 0 0;line-height:1.7;">
                                <div><strong>Khách hàng:</strong> ${customer.name || ''}</div>
                                <div><strong>Điện thoại:</strong> ${customer.phone || ''}</div>
                                <div><strong>Email:</strong> ${customer.email || ''}</div>
                                <div><strong>Địa chỉ:</strong> ${customer.address || ''}</div>
                            </div>
                            ${itemsHtml}
                            <div class="order-bottom">
                                <div class="total-area">
                                    Tổng số tiền: <strong>${total}</strong>
                                </div>
                            </div>
                        </div>
                        `;
        }).join('');
        // Nút phân trang
        const totalPages = Math.ceil(userOrders.length / ORDERS_PER_PAGE);
        if (totalPages > 1) {
            let pagNav = '<div style="text-align:center;margin:18px 0 0 0;">';
            for (let i = 1; i <= totalPages; i++) {
                pagNav += `<button style="margin:0 4px;padding:4px 12px;border-radius:6px;border:1px solid #ccc;background:${i === page ? '#2d8a68' : '#fff'};color:${i === page ? '#fff' : '#222'};cursor:pointer;font-weight:600;" onclick="window.renderOrdersPageUser(${i})">${i}</button>`;
            }
            pagNav += '</div>';
            ordersList.innerHTML += pagNav;
        }
    }
    window.renderOrdersPageUser = renderOrdersPage;
    renderOrdersPage(1);
});

// Hiển thị thông tin user từ localStorage
document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('tripleT_currentUser'));
    if (user) {
        document.getElementById('user-fullname').textContent = user.name || '—';
        // Nếu username là số điện thoại thì hiển thị, nếu là email thì hiển thị đúng trường
        const phoneRegex = /^(0[3|5|7|8|9])([0-9]{8})$/;
        if (phoneRegex.test(user.username)) {
            document.getElementById('user-phone').textContent = user.username;
            document.getElementById('user-email').textContent = user.email || '—';
        } else {
            document.getElementById('user-email').textContent = user.username;
            document.getElementById('user-phone').textContent = user.phone || '—';
        }
        // Có thể tính rank dựa vào role hoặc số đơn hàng nếu muốn
    }
});