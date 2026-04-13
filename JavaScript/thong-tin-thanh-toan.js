document.getElementById("payment-form").addEventListener("submit", function (e) {
    e.preventDefault();

    // 🧍 Thông tin khách hàng
    const customer = {
        name: document.getElementById("pay-name").value,
        phone: document.getElementById("pay-phone").value,
        email: document.getElementById("pay-email").value,
        address: document.getElementById("pay-address").value
    };

    // 🛒 Lấy giỏ hàng
    const cart = JSON.parse(localStorage.getItem("triplet_cart_v1")) || [];

    // 💰 Tính tổng tiền
    const total = cart.reduce((sum, item) => {
        return sum + item.price * item.qty;
    }, 0);

    // 📦 Tạo đơn hàng
    let iduser = JSON.parse(localStorage.getItem("tripleT_currentUser")) || {};
    const order = {
        id: "ORD-" + Date.now(),
        iduser: iduser.id || iduser.username || null,
        customer: customer,
        items: cart,
        total: total,
        createdAt: new Date().toLocaleString()
    };

    // 📚 Lấy danh sách đơn cũ
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    // ➕ Thêm đơn mới
    orders.push(order);

    localStorage.setItem("orders", JSON.stringify(orders));

    const data = [];

    orders.forEach(order => {
        order.items.forEach(item => {
            data.push({
                "Mã đơn": order.id,
                "id user": order.iduser || '',
                "Tên khách": order.customer.name,
                "SĐT": order.customer.phone,
                "Email": order.customer.email,
                "Địa chỉ": order.customer.address,
                "Sản phẩm": item.name,
                "Số lượng": item.qty,
                "Giá": item.price,
                "Thành tiền": item.price * item.qty,
                "Tổng đơn": order.total,
                "Ngày": order.createdAt
            });
        });
    });



    localStorage.removeItem('triplet_cart_v1');

    // 🎉 Thông báo
    alert("Đặt hàng thành công!");

    // 👉 chuyển trang
    window.location.href = "success.html";
});