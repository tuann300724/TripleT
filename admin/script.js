// ====== TÍNH NĂNG CAO CẤP ======
let notifications = [
    { id: 1, message: "Đơn hàng #1 đã được giao thành công!", read: false, time: Date.now() },
    { id: 2, message: "Sản phẩm Vợt Yonex Astrox 100ZZ sắp hết hàng!", read: false, time: Date.now() - 3600000 },
    { id: 3, message: "Khuyến mãi SUMMER30 sắp kết thúc!", read: true, time: Date.now() - 86400000 }
];
let dashboardWidgets = ['revenue-chart', 'top-products', 'recent-orders', 'category-chart'];

// Hàm thông báo real-time (simulate)
function addNotification(message) {
    const newNotif = { id: Date.now(), message, read: false, time: Date.now() };
    notifications.unshift(newNotif);
    saveData('notifications', notifications);
    updateNotificationUI();
    showToast(message);
}

// Cập nhật giao diện thông báo
function updateNotificationUI() {
    const count = notifications.filter(n => !n.read).length;
    document.getElementById('notificationCount').innerText = count;
    const list = document.getElementById('notificationList');
    if (list) {
        list.innerHTML = notifications.slice(0, 10).map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div>${n.message}</div>
                <small>${new Date(n.time).toLocaleString()}</small>
            </div>
        `).join('');
        document.querySelectorAll('.notification-item').forEach(el => {
            el.addEventListener('click', () => markAsRead(parseInt(el.dataset.id)));
        });
    }
}

function markAsRead(id) {
    const notif = notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    saveData('notifications', notifications);
    updateNotificationUI();
}

// Backup dữ liệu
function backupData() {
    const data = {
        categories: getData('categories'),
        products: getData('products'),
        users: getData('users'),
        orders: getData('orders'),
        promotions: getData('promotions'),
        reviews: getData('reviews'),
        suppliers: getData('suppliers'),
        imports: getData('imports'),
        notifications: getData('notifications')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triplet_backup_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã sao lưu dữ liệu thành công!');
}

// Restore dữ liệu
function restoreData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.categories) saveData('categories', data.categories);
            if (data.products) saveData('products', data.products);
            if (data.users) saveData('users', data.users);
            if (data.orders) saveData('orders', data.orders);
            if (data.promotions) saveData('promotions', data.promotions);
            if (data.reviews) saveData('reviews', data.reviews);
            if (data.suppliers) saveData('suppliers', data.suppliers);
            if (data.imports) saveData('imports', data.imports);
            if (data.notifications) saveData('notifications', data.notifications);
            showToast('Phục hồi dữ liệu thành công!');
            location.reload();
        } catch(err) {
            showToast('File không hợp lệ!', true);
        }
    };
    reader.readAsText(file);
}

// Import Excel
function importExcel(file, entityType) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        let currentData = getData(entityType);
        rows.forEach(row => {
            const newId = Date.now() + Math.random();
            let newItem = { id: newId };
            if (entityType === 'products') {
                newItem.name = row['Tên sản phẩm'] || row.name;
                newItem.price = parseFloat(row['Giá'] || row.price);
                newItem.categoryId = parseInt(row['Danh mục ID'] || row.categoryId) || 1;
                newItem.stock = parseInt(row['Tồn kho'] || row.stock) || 0;
                newItem.description = row['Mô tả'] || '';
                newItem.image = "🏸";
            } else if (entityType === 'categories') {
                newItem.name = row['Tên loại'] || row.name;
                newItem.slug = newItem.name.toLowerCase().replace(/ /g, '-');
            } // Thêm các entity khác tương tự
            currentData.push(newItem);
        });
        saveData(entityType, currentData);
        showToast(`Đã import ${rows.length} dòng vào ${entityType}`);
        renderSection(currentSection);
    };
    reader.readAsArrayBuffer(file);
}

// Export PDF (báo cáo)
function exportToPDF(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
    showToast('Đang xuất PDF...');
}

// Dashboard kéo thả
function initDraggableDashboard() {
    const container = document.querySelector('.dashboard-grid');
    if (!container) return;
    let dragSrc = null;
    container.querySelectorAll('.dashboard-widget').forEach(widget => {
        widget.setAttribute('draggable', true);
        widget.addEventListener('dragstart', (e) => {
            dragSrc = widget;
            e.dataTransfer.effectAllowed = 'move';
        });
        widget.addEventListener('dragover', (e) => e.preventDefault());
        widget.addEventListener('drop', (e) => {
            e.preventDefault();
            if (dragSrc && dragSrc !== widget) {
                const parent = widget.parentNode;
                const children = [...parent.children];
                const dragIndex = children.indexOf(dragSrc);
                const dropIndex = children.indexOf(widget);
                if (dragIndex < dropIndex) {
                    parent.insertBefore(dragSrc, widget.nextSibling);
                } else {
                    parent.insertBefore(dragSrc, widget);
                }
                // Lưu thứ tự mới
                const newOrder = [...parent.querySelectorAll('.dashboard-widget')].map(w => w.id);
                localStorage.setItem('dashboardOrder', JSON.stringify(newOrder));
            }
        });
    });
}

// Cập nhật dashboard render với các widget
async function renderDashboard(container) {
    // ... code cũ, nhưng thay vì tĩnh, tạo các widget kéo thả
    const savedOrder = JSON.parse(localStorage.getItem('dashboardOrder')) || [];
    const widgetsHtml = `
        <div class="dashboard-grid" id="dashboardGrid">
            <div class="dashboard-widget" id="widget-stats">
                <div class="widget-header"><h3>📊 Thống kê nhanh</h3><i class="fas fa-grip-vertical"></i></div>
                <div class="stats-grid" style="grid-template-columns: repeat(2,1fr);">
                    <!-- các stat-card -->
                </div>
            </div>
            <div class="dashboard-widget" id="widget-revenueChart">
                <div class="widget-header"><h3>📈 Doanh thu 6 tháng</h3><i class="fas fa-grip-vertical"></i></div>
                <canvas id="miniRevenueChart" height="200"></canvas>
            </div>
            <div class="dashboard-widget" id="widget-topProducts">
                <div class="widget-header"><h3>🏆 Top sản phẩm</h3><i class="fas fa-grip-vertical"></i></div>
                <div id="topProductsList"></div>
            </div>
            <div class="dashboard-widget" id="widget-recentOrders">
                <div class="widget-header"><h3>📦 Đơn gần đây</h3><i class="fas fa-grip-vertical"></i></div>
                <div id="recentOrdersList"></div>
            </div>
        </div>
    `;
    container.innerHTML = widgetsHtml;
    // Fill dữ liệu và vẽ biểu đồ
    // ... code fill dữ liệu
    initDraggableDashboard();
}
// ------------------- KHO DỮ LIỆU LOCALSTORAGE & SEED -------------------
let currentUser = null;
let currentSection = 'dashboard';
let currentEditId = null;
let currentEntityType = null;
let revenueChart = null;
let pendingConfirmCallback = null;
// Dark mode toggle
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const toggleIcon = document.querySelector('#darkModeToggle i');
        if (toggleIcon) toggleIcon.className = 'fas fa-sun';
    } else {
        document.body.classList.remove('dark-mode');
        const toggleIcon = document.querySelector('#darkModeToggle i');
        if (toggleIcon) toggleIcon.className = 'fas fa-moon';
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const toggleIcon = document.querySelector('#darkModeToggle i');
    if (toggleIcon) {
        toggleIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    showToast(isDark ? 'Đã chuyển sang chế độ tối' : 'Đã chuyển sang chế độ sáng');
}

// Gắn sự kiện sau khi DOM load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    const darkModeBtn = document.getElementById('darkModeToggle');
    if (darkModeBtn) darkModeBtn.addEventListener('click', toggleDarkMode);
});

// Khởi tạo dữ liệu mẫu với tên cụ thể
function initData() {
    if (!localStorage.getItem('categories')) {
        const cats = [
            { id: 1, name: "Vợt cầu lông", slug: "vot-cau-long" },
            { id: 2, name: "Cầu lông", slug: "cau-long" },
            { id: 3, name: "Giày cầu lông", slug: "giay-cau-long" },
            { id: 4, name: "Áo thi đấu", slug: "ao-thi-dau" },
            { id: 5, name: "Quần short", slug: "quan-short" },
            { id: 6, name: "Phụ kiện", slug: "phu-kien" },
            { id: 7, name: "Túi đựng vợt", slug: "tui-dung-vot" },
            { id: 8, name: "Băng vợt", slug: "bang-vot" },
            { id: 9, name: "Balo thể thao", slug: "balo-the-thao" },
            { id: 10, name: "Dây giày", slug: "day-giay" }
        ];
        localStorage.setItem('categories', JSON.stringify(cats));
    }
    
    if (!localStorage.getItem('products')) {
        let products = [
            { id: 1, name: "Vợt Yonex Astrox 100ZZ", price: 3890000, stock: 15, categoryId: 1, image: "🏸", description: "Vợt cao cấp dành cho vận động viên chuyên nghiệp" },
            { id: 2, name: "Vợt Yonex Nanflare 800", price: 3250000, stock: 12, categoryId: 1, image: "🏸", description: "Vợt siêu nhẹ, tốc độ cực nhanh" },
            { id: 3, name: "Vợt Lining Aeronaut 9000", price: 2890000, stock: 8, categoryId: 1, image: "🏸", description: "Vợt kiểm soát lực tốt" },
            { id: 4, name: "Vợt Victor Thruster F", price: 2750000, stock: 10, categoryId: 1, image: "🏸", description: "Vợt tấn công mạnh mẽ" },
            { id: 5, name: "Cầu lông Yonex Aerosensa 50", price: 420000, stock: 100, categoryId: 2, image: "🪶", description: "Cầu lông cao cấp 1 túi 12 quả" },
            { id: 6, name: "Cầu lông Victor Master No.1", price: 380000, stock: 85, categoryId: 2, image: "🪶", description: "Cầu lông chất lượng cao, độ bền tốt" },
            { id: 7, name: "Cầu lông Lining A+60", price: 350000, stock: 120, categoryId: 2, image: "🪶", description: "Cầu lông tập luyện phổ biến" },
            { id: 8, name: "Giày Yonex 65Z3", price: 2250000, stock: 20, categoryId: 3, image: "👟", description: "Giày cầu lông cao cấp, êm chân" },
            { id: 9, name: "Giày Victor P9200", price: 1980000, stock: 15, categoryId: 3, image: "👟", description: "Giày chống trượt tốt" },
            { id: 10, name: "Giày Lining Iron", price: 1750000, stock: 12, categoryId: 3, image: "👟", description: "Giày bền, đẹp" },
            { id: 11, name: "Áo thi đấu Yonex 2024", price: 550000, stock: 45, categoryId: 4, image: "👕", description: "Áo co giãn tốt, thấm hút mồ hôi" },
            { id: 12, name: "Áo thi đấu Victor", price: 490000, stock: 38, categoryId: 4, image: "👕", description: "Áo thể thao cao cấp" },
            { id: 13, name: "Quần short Yonex", price: 350000, stock: 42, categoryId: 5, image: "👖", description: "Quần short thoải mái khi vận động" },
            { id: 14, name: "Túi đựng vợt 6 cây", price: 850000, stock: 18, categoryId: 7, image: "🎒", description: "Túi đựng tối đa 6 vợt" },
            { id: 15, name: "Băng vợt Yonex", price: 85000, stock: 200, categoryId: 8, image: "📦", description: "Băng quấn cán vợt cao cấp" }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    if (!localStorage.getItem('users')) {
        let users = [
            { id: 1, name: "Nguyễn Văn An", email: "an.nguyen@email.com", phone: "0912345678", role: "admin", created_at: "2024-01-15" },
            { id: 2, name: "Trần Thị Bình", email: "binh.tran@email.com", phone: "0923456789", role: "customer", created_at: "2024-02-20" },
            { id: 3, name: "Lê Hoàng Cường", email: "cuong.le@email.com", phone: "0934567890", role: "customer", created_at: "2024-03-10" },
            { id: 4, name: "Phạm Thị Dung", email: "dung.pham@email.com", phone: "0945678901", role: "customer", created_at: "2024-03-25" },
            { id: 5, name: "Hoàng Văn Em", email: "em.hoang@email.com", phone: "0956789012", role: "customer", created_at: "2024-04-05" },
            { id: 6, name: "Đỗ Thị Phương", email: "phuong.do@email.com", phone: "0967890123", role: "customer", created_at: "2024-04-18" },
            { id: 7, name: "Vũ Quang Hải", email: "hai.vu@email.com", phone: "0978901234", role: "customer", created_at: "2024-05-02" },
            { id: 8, name: "Bùi Thị Linh", email: "linh.bui@email.com", phone: "0989012345", role: "customer", created_at: "2024-05-20" },
            { id: 9, name: "Đặng Văn Minh", email: "minh.dang@email.com", phone: "0990123456", role: "customer", created_at: "2024-06-08" },
            { id: 10, name: "Ngô Thị Ngọc", email: "ngoc.ngo@email.com", phone: "0901234567", role: "customer", created_at: "2024-06-22" },
            { id: 11, name: "Trương Văn Phúc", email: "phuc.truong@email.com", phone: "0913456789", role: "customer", created_at: "2024-07-01" },
            { id: 12, name: "Lý Thị Quyên", email: "quyen.ly@email.com", phone: "0924567890", role: "customer", created_at: "2024-07-15" }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    if (!localStorage.getItem('orders')) {
        let orders = [
            { id: 1, userId: 2, total: 3890000, status: "delivered", orderDate: "2025-06-10", items: [{ productId: 1, qty: 1 }] },
            { id: 2, userId: 3, total: 420000, status: "delivered", orderDate: "2025-06-12", items: [{ productId: 5, qty: 1 }] },
            { id: 3, userId: 4, total: 2250000, status: "delivered", orderDate: "2025-06-15", items: [{ productId: 8, qty: 1 }] },
            { id: 4, userId: 5, total: 350000, status: "pending", orderDate: "2025-06-18", items: [{ productId: 13, qty: 1 }] },
            { id: 5, userId: 6, total: 5980000, status: "processing", orderDate: "2025-06-20", items: [{ productId: 1, qty: 1 }, { productId: 8, qty: 1 }] },
            { id: 6, userId: 7, total: 850000, status: "delivered", orderDate: "2025-06-22", items: [{ productId: 14, qty: 1 }] },
            { id: 7, userId: 8, total: 2750000, status: "cancelled", orderDate: "2025-06-25", items: [{ productId: 4, qty: 1 }] },
            { id: 8, userId: 9, total: 490000, status: "delivered", orderDate: "2025-06-28", items: [{ productId: 12, qty: 1 }] },
            { id: 9, userId: 10, total: 7220000, status: "processing", orderDate: "2025-07-01", items: [{ productId: 2, qty: 1 }, { productId: 9, qty: 1 }, { productId: 5, qty: 1 }] },
            { id: 10, userId: 2, total: 1750000, status: "delivered", orderDate: "2025-07-03", items: [{ productId: 10, qty: 1 }] },
            { id: 11, userId: 3, total: 380000, status: "delivered", orderDate: "2025-07-05", items: [{ productId: 6, qty: 1 }] },
            { id: 12, userId: 11, total: 4640000, status: "pending", orderDate: "2025-07-08", items: [{ productId: 3, qty: 1 }, { productId: 11, qty: 1 }] },
            { id: 13, userId: 12, total: 85000, status: "delivered", orderDate: "2025-07-10", items: [{ productId: 15, qty: 2 }] },
            { id: 14, userId: 4, total: 3250000, status: "processing", orderDate: "2025-07-12", items: [{ productId: 2, qty: 1 }] },
            { id: 15, userId: 6, total: 550000, status: "delivered", orderDate: "2025-07-14", items: [{ productId: 11, qty: 1 }] }
        ];
        localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    // Dữ liệu cho các tính năng bổ sung
    if (!localStorage.getItem('promotions')) {
        const promotions = [
            { id: 1, code: "SUMMER30", discount: 30, type: "percent", startDate: "2025-06-01", endDate: "2025-08-31", active: true, minOrder: 300000 },
            { id: 2, code: "FREESHIP", discount: 50000, type: "fixed", startDate: "2025-07-01", endDate: "2025-07-31", active: true, minOrder: 500000 },
            { id: 3, code: "NEWUSER20", discount: 20, type: "percent", startDate: "2025-01-01", endDate: "2025-12-31", active: true, minOrder: 0 }
        ];
        localStorage.setItem('promotions', JSON.stringify(promotions));
    }
    
    if (!localStorage.getItem('reviews')) {
        const reviews = [
            { id: 1, productId: 1, userId: 2, rating: 5, comment: "Vợt Yonex Astrox 100ZZ quá đỉnh! Cảm giác cầm vợt rất chắc chắn, đánh cầu uy lực.", date: "2025-06-15", status: "approved" },
            { id: 2, productId: 5, userId: 3, rating: 4, comment: "Cầu lông bay chuẩn, độ bền tốt. Sẽ ủng hộ shop tiếp!", date: "2025-06-18", status: "approved" },
            { id: 3, productId: 8, userId: 4, rating: 5, comment: "Giày Yonex 65Z3 êm chân lắm, đúng chất Nhật.", date: "2025-06-20", status: "approved" },
            { id: 4, productId: 14, userId: 7, rating: 4, comment: "Túi đựng vợt rộng rãi, chất liệu tốt.", date: "2025-06-25", status: "approved" },
            { id: 5, productId: 4, userId: 8, rating: 3, comment: "Vợt ổn, nhưng hơi nặng so với mô tả.", date: "2025-06-28", status: "pending" },
            { id: 6, productId: 2, userId: 10, rating: 5, comment: "Nanflare 800 nhẹ như không, đánh cực sung!", date: "2025-07-03", status: "approved" }
        ];
        localStorage.setItem('reviews', JSON.stringify(reviews));
    }
    
    if (!localStorage.getItem('suppliers')) {
        const suppliers = [
            { id: 1, name: "Công ty TNHH Yonex Việt Nam", contact: "Nguyễn Văn Anh", phone: "02838456789", email: "contact@yonex.vn", address: "Số 10 Đường số 3, KCN Tân Bình, TP.HCM", status: "active" },
            { id: 2, name: "Victor Sports Việt Nam", contact: "Trần Thị Bích", phone: "02438567890", email: "sales@victor.vn", address: "Số 45 Lê Văn Lương, Quận Thanh Xuân, Hà Nội", status: "active" },
            { id: 3, name: "Li-Ning Vietnam Co., Ltd", contact: "Lê Văn Cường", phone: "02363987654", email: "info@lining.vn", address: "Số 78 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng", status: "active" }
        ];
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    }
    
    if (!localStorage.getItem('imports')) {
        const imports = [
            { id: 1, supplierId: 1, productId: 1, quantity: 50, price: 2800000, importDate: "2025-06-05", status: "completed" },
            { id: 2, supplierId: 1, productId: 2, quantity: 40, price: 2350000, importDate: "2025-06-05", status: "completed" },
            { id: 3, supplierId: 2, productId: 4, quantity: 30, price: 1950000, importDate: "2025-06-10", status: "completed" },
            { id: 4, supplierId: 3, productId: 3, quantity: 25, price: 2100000, importDate: "2025-06-12", status: "completed" },
            { id: 5, supplierId: 1, productId: 5, quantity: 200, price: 300000, importDate: "2025-06-15", status: "completed" },
            { id: 6, supplierId: 1, productId: 8, quantity: 60, price: 1650000, importDate: "2025-06-18", status: "completed" }
        ];
        localStorage.setItem('imports', JSON.stringify(imports));
    }
}
initData();

// Helper lấy dữ liệu
function getData(entity) {
    return JSON.parse(localStorage.getItem(entity)) || [];
}
function saveData(entity, data) {
    localStorage.setItem(entity, JSON.stringify(data));
}

// Hiển thị thông báo
function showToast(message, isError = false) {
    const toast = document.getElementById('toastNotification');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#b91c1c' : 'var(--green-dark)';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Hiển thị modal xác nhận
function showConfirm(title, message, callback) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').innerHTML = `<i class="fas fa-question-circle"></i> ${title}`;
    document.getElementById('confirmMessage').textContent = message;
    pendingConfirmCallback = callback;
    modal.style.display = 'flex';
}

// Xuất dữ liệu ra CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast("Không có dữ liệu để xuất!");
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header] || '';
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất ${filename}`);
}

// Format tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Render động theo section
async function renderSection(section) {
    currentSection = section;
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        if(li.dataset.section === section) li.classList.add('active');
        else li.classList.remove('active');
    });
    const titleMap = {
        dashboard:'Tổng quan', categories:'Loại sản phẩm', products:'Sản phẩm',
        users:'Quản lý người dùng', orders:'Đơn hàng', revenue:'Phân tích doanh thu',
        promotions:'Khuyến mãi', reviews:'Đánh giá sản phẩm', suppliers:'Nhà cung cấp', imports:'Nhập hàng'
    };
    document.getElementById('mainTitle').innerHTML = `<i class="fas ${getIconForSection(section)}"></i> ${titleMap[section] || section}`;
    const container = document.getElementById('dynamicContent');
    if(section === 'dashboard') await renderDashboard(container);
    else if(section === 'categories') await renderCategoryTable(container);
    else if(section === 'products') await renderProductTable(container);
    else if(section === 'users') await renderUserTable(container);
    else if(section === 'orders') await renderOrderTable(container);
    else if(section === 'revenue') await renderRevenuePage(container);
    else if(section === 'promotions') await renderPromotionTable(container);
    else if(section === 'reviews') await renderReviewTable(container);
    else if(section === 'suppliers') await renderSupplierTable(container);
    else if(section === 'imports') await renderImportTable(container);
}

function getIconForSection(section) {
    const icons = {
        dashboard: 'fa-tachometer-alt',
        categories: 'fa-tags',
        products: 'fa-table-tennis-paddle-ball',
        users: 'fa-users',
        orders: 'fa-shopping-cart',
        revenue: 'fa-chart-line',
        promotions: 'fa-gift',
        reviews: 'fa-star',
        suppliers: 'fa-truck',
        imports: 'fa-dolly'
    };
    return icons[section] || 'fa-folder';
}

// DASHBOARD
async function renderDashboard(container) {
    const products = getData('products');
    const orders = getData('orders');
    const users = getData('users');
    const promotions = getData('promotions');
    const reviews = getData('reviews');
    
    const totalRevenue = orders.reduce((sum,o)=> o.status==='delivered'? sum+o.total:sum,0);
    const pendingOrders = orders.filter(o=>o.status==='pending').length;
    const activePromotions = promotions.filter(p=>p.active).length;
    const avgRating = reviews.filter(r=>r.status==='approved').reduce((sum,r)=>sum+r.rating,0) / (reviews.filter(r=>r.status==='approved').length || 1);
    
    // Thống kê đơn hàng theo tháng
    const monthlyOrders = {};
    orders.forEach(o => {
        if(o.status === 'delivered') {
            const month = o.orderDate.slice(0,7);
            monthlyOrders[month] = (monthlyOrders[month] || 0) + o.total;
        }
    });
    
    const chartLabels = Object.keys(monthlyOrders).sort().slice(-6);
    const chartData = chartLabels.map(l => monthlyOrders[l]);
    
    // Lấy top sản phẩm bán chạy
    const productSales = {};
    orders.forEach(o => {
        if(o.status === 'delivered' && o.items) {
            o.items.forEach(item => {
                productSales[item.productId] = (productSales[item.productId] || 0) + item.qty;
            });
        }
    });
    const topProducts = Object.entries(productSales).sort((a,b) => b[1] - a[1]).slice(0, 5);
    const topProductsHtml = topProducts.map(([id, qty]) => {
        const product = products.find(p => p.id == id);
        return `<tr><td>${product?.name || 'N/A'}</td><td>${qty} sản phẩm</td></tr>`;
    }).join('');
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><i class="fas fa-box"></i><h3>${products.length}</h3><p>Sản phẩm</p></div>
            <div class="stat-card"><i class="fas fa-shopping-bag"></i><h3>${orders.length}</h3><p>Đơn hàng</p></div>
            <div class="stat-card"><i class="fas fa-dollar-sign"></i><h3>${formatCurrency(totalRevenue)}</h3><p>Doanh thu (đã giao)</p></div>
            <div class="stat-card"><i class="fas fa-users"></i><h3>${users.length}</h3><p>Người dùng</p></div>
            <div class="stat-card"><i class="fas fa-clock"></i><h3>${pendingOrders}</h3><p>Đơn chờ xử lý</p></div>
            <div class="stat-card"><i class="fas fa-gift"></i><h3>${activePromotions}</h3><p>Khuyến mãi đang chạy</p></div>
            <div class="stat-card"><i class="fas fa-star"></i><h3>${avgRating.toFixed(1)}</h3><p>Đánh giá trung bình</p></div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
            <div style="background:white; border-radius:1.5rem; padding:1.5rem;">
                <h3>📈 Doanh thu 6 tháng gần nhất</h3>
                <canvas id="miniRevenueChart" height="200"></canvas>
            </div>
            <div style="background:white; border-radius:1.5rem; padding:1.5rem;">
                <h3>🏆 Top sản phẩm bán chạy</h3>
                <table class="data-table"><thead><tr><th>Sản phẩm</th><th>Số lượng bán</th></tr></thead><tbody>${topProductsHtml || '<tr><td colspan="2">Chưa có dữ liệu</td></tr>'}</tbody></table>
            </div>
        </div>
        <div style="background:white; border-radius:1.5rem; padding:1.5rem; margin-top:1.5rem;">
            <h3>📦 Đơn hàng gần đây</h3>
            <table class="data-table"><thead><tr><th>ID</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>
            ${orders.slice(0,5).map(o => {
                const user = getData('users').find(u => u.id === o.userId);
                return `<tr><td>#${o.id}</td><td>${user?.name || 'Khách'}</td><td>${formatCurrency(o.total)}</td><td>${o.status}</td></tr>`;
            }).join('')}
            </tbody></table>
        </div>
    `;
    
    setTimeout(() => {
        const ctx = document.getElementById('miniRevenueChart')?.getContext('2d');
        if(ctx) {
            new Chart(ctx, { 
                type: 'line', 
                data: { labels: chartLabels, datasets: [{ label: 'Doanh thu (VND)', data: chartData, borderColor: '#1a5c4a', tension: 0.3, fill: true, backgroundColor: 'rgba(26,92,74,0.1)' }] } 
            });
        }
    }, 100);
}

// CATEGORIES
async function renderCategoryTable(container) {
    let cats = getData('categories');
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addCategoryBtn"><i class="fas fa-plus"></i> Thêm loại SP</button>
            <button class="btn-add" id="exportCategoryBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất CSV</button>
        </div>
        <div style="overflow-x:auto">
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Tên loại sản phẩm</th><th>Slug</th><th>Số lượng SP</th><th>Thao tác</th></tr>
                </thead>
                <tbody>
                    ${cats.map(c => {
                        const productCount = getData('products').filter(p => p.categoryId === c.id).length;
                        return `<tr>
                            <td>${c.id}</td>
                            <td><i class="fas fa-tag"></i> ${c.name}</td>
                            <td>${c.slug}</td>
                            <td><span class="badge-status bg-success">${productCount} sản phẩm</span></td>
                            <td>
                                <button class="btn-icon btn-edit" data-id="${c.id}" data-action="editCat"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon btn-delete" data-id="${c.id}" data-action="delCat"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 1rem;">
            <i class="fas fa-info-circle"></i> Tổng cộng: <strong>${cats.length}</strong> loại sản phẩm
        </div>
    `;
    document.getElementById('addCategoryBtn')?.addEventListener('click',()=> openModal('category',null));
    document.getElementById('exportCategoryBtn')?.addEventListener('click',()=> exportToCSV(cats, 'categories.csv'));
    document.querySelectorAll('[data-action="editCat"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let cat = getData('categories').find(c=>c.id===id);
            openModal('category',cat);
        });
    });
    document.querySelectorAll('[data-action="delCat"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            showConfirm('Xóa loại sản phẩm', 'Xóa loại sản phẩm sẽ ảnh hưởng đến sản phẩm liên quan. Bạn có chắc chắn?', () => {
                let id = parseInt(btn.dataset.id);
                let newCats = getData('categories').filter(c=>c.id!==id);
                saveData('categories',newCats);
                renderCategoryTable(container);
                showToast('Đã xóa loại sản phẩm');
            });
        });
    });
}

// PRODUCTS
async function renderProductTable(container) {
    let products = getData('products');
    let cats = getData('categories');
    
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addProductBtn"><i class="fas fa-plus"></i> Thêm sản phẩm</button>
            <input type="text" id="searchProduct" placeholder="🔍 Tìm kiếm sản phẩm..." style="padding:0.5rem 1rem;border-radius:2rem;border:1px solid #ddd;">
            <select id="filterCategory">
                <option value="">📁 Tất cả danh mục</option>
                ${cats.map(c=>`<option value="${c.id}">📌 ${c.name}</option>`).join('')}
            </select>
            <button class="btn-add" id="exportProductBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất CSV</button>
        </div>
        <div style="overflow-x:auto">
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Sản phẩm</th><th>Giá</th><th>Danh mục</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr>
                </thead>
                <tbody id="productTableBody"></tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 1rem;">
            <i class="fas fa-chart-line"></i> Tổng giá trị kho: <strong>${formatCurrency(products.reduce((sum,p)=>sum + (p.price * p.stock), 0))}</strong>
        </div>
    `;
    
    function renderProductList() {
        const searchTerm = document.getElementById('searchProduct')?.value.toLowerCase() || '';
        const filterCat = document.getElementById('filterCategory')?.value || '';
        let filtered = products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchTerm);
            const matchCat = !filterCat || p.categoryId == filterCat;
            return matchSearch && matchCat;
        });
        const tbody = document.getElementById('productTableBody');
        if(tbody) {
            tbody.innerHTML = filtered.map(p => {
                let catName = cats.find(c=>c.id===p.categoryId)?.name || 'Khác';
                let stockStatus = p.stock > 20 ? 'bg-success' : (p.stock > 5 ? 'bg-warning' : 'bg-danger');
                let stockText = p.stock > 20 ? 'Còn hàng' : (p.stock > 5 ? 'Sắp hết' : 'Hết hàng');
                return `<tr>
                    <td>${p.id}</td>
                    <td><strong>${p.name}</strong><br><small style="color:#666;">${p.description?.substring(0, 50) || ''}</small></td>
                    <td><strong style="color:#1a5c4a;">${formatCurrency(p.price)}</strong></td>
                    <td><span class="badge-status bg-success">${catName}</span></td>
                    <td><span class="badge-status ${stockStatus}">${p.stock} sp (${stockText})</span></td>
                    <td><span class="badge-status ${p.stock > 0 ? 'bg-success' : 'bg-warning'}">${p.stock > 0 ? 'Kinh doanh' : 'Tạm hết'}</span></td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${p.id}" data-action="editProd"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" data-id="${p.id}" data-action="delProd"><i class="fas fa-trash"></i></button>
                        <button class="btn-icon" data-id="${p.id}" data-action="viewStock" style="color:#2d8f73;"><i class="fas fa-chart-line"></i></button>
                    </td>
                </tr>`;
            }).join('');
            
            document.querySelectorAll('[data-action="editProd"]').forEach(btn=>{
                btn.removeEventListener('click', handleEditProd);
                btn.addEventListener('click', handleEditProd);
            });
            document.querySelectorAll('[data-action="delProd"]').forEach(btn=>{
                btn.removeEventListener('click', handleDelProd);
                btn.addEventListener('click', handleDelProd);
            });
            document.querySelectorAll('[data-action="viewStock"]').forEach(btn=>{
                btn.removeEventListener('click', handleViewStock);
                btn.addEventListener('click', handleViewStock);
            });
        }
    }
    
    function handleEditProd(e) {
        let id = parseInt(e.currentTarget.dataset.id);
        let prod = getData('products').find(p=>p.id===id);
        openModal('product',prod);
    }
    
    function handleDelProd(e) {
        let id = parseInt(e.currentTarget.dataset.id);
        showConfirm('Xóa sản phẩm', 'Bạn có chắc chắn muốn xóa sản phẩm này?', () => {
            let newProds = getData('products').filter(p=>p.id!==id);
            saveData('products',newProds);
            products = newProds;
            renderProductList();
            showToast('Đã xóa sản phẩm');
        });
    }
    
    function handleViewStock(e) {
        let id = parseInt(e.currentTarget.dataset.id);
        let prod = getData('products').find(p=>p.id===id);
        showToast(`${prod.name}: Tồn kho ${prod.stock} sản phẩm, giá trị ${formatCurrency(prod.price * prod.stock)}`);
    }
    
    document.getElementById('addProductBtn')?.addEventListener('click',()=>openModal('product',null));
    document.getElementById('exportProductBtn')?.addEventListener('click',()=> exportToCSV(products, 'products.csv'));
    document.getElementById('searchProduct')?.addEventListener('input', renderProductList);
    document.getElementById('filterCategory')?.addEventListener('change', renderProductList);
    renderProductList();
}

// USERS
async function renderUserTable(container) {
    let users = getData('users');
    let orders = getData('orders');
    
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addUserBtn"><i class="fas fa-plus"></i> Thêm người dùng</button>
            <input type="text" id="searchUser" placeholder="🔍 Tìm kiếm theo tên hoặc email..." style="padding:0.5rem 1rem;border-radius:2rem;border:1px solid #ddd;">
            <select id="filterUserRole">
                <option value="">📋 Tất cả vai trò</option>
                <option value="admin">👑 Admin</option>
                <option value="customer">👤 Khách hàng</option>
            </select>
            <button class="btn-add" id="exportUserBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất CSV</button>
        </div>
        <div style="overflow-x:auto">
            <table class="data-table">
                <thead>
                    <tr><th>ID</th><th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Vai trò</th><th>Số đơn hàng</th><th>Ngày tham gia</th><th>Thao tác</th></tr>
                </thead>
                <tbody id="userTableBody"></tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 1rem;">
            <i class="fas fa-users"></i> Tổng số: <strong>${users.length}</strong> người dùng (${users.filter(u=>u.role==='admin').length} Admin, ${users.filter(u=>u.role==='customer').length} Khách hàng)
        </div>
    `;
    
    function renderUserList() {
        const searchTerm = document.getElementById('searchUser')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('filterUserRole')?.value || '';
        let filtered = users.filter(u => {
            const matchSearch = u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm);
            const matchRole = !roleFilter || u.role === roleFilter;
            return matchSearch && matchRole;
        });
        const tbody = document.getElementById('userTableBody');
        if(tbody) {
            tbody.innerHTML = filtered.map(u => {
                const userOrders = orders.filter(o => o.userId === u.id);
                const totalSpent = userOrders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
                return `<tr>
                    <td>${u.id}</td>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td>${u.phone || 'Chưa cập nhật'}</td>
                    <td>${u.role === 'admin' ? '<span class="badge-status bg-success">👑 Admin</span>' : '<span class="badge-status">👤 Khách hàng</span>'}</td>
                    <td>${userOrders.length} đơn <br><small>${formatCurrency(totalSpent)}</small></td>
                    <td>${u.created_at}</td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${u.id}" data-action="editUser"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" data-id="${u.id}" data-action="delUser"><i class="fas fa-trash"></i></button>
                        <button class="btn-icon" data-id="${u.id}" data-action="viewOrders" style="color:#2d8f73;"><i class="fas fa-shopping-bag"></i></button>
                    </td>
                </tr>`;
            }).join('');
            
            document.querySelectorAll('[data-action="editUser"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    let id = parseInt(btn.dataset.id);
                    let user = users.find(u=>u.id===id);
                    openModal('user',user);
                });
            });
            document.querySelectorAll('[data-action="delUser"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    showConfirm('Xóa người dùng', 'Bạn có chắc chắn muốn xóa người dùng này?', () => {
                        let id = parseInt(btn.dataset.id);
                        let newUsers = users.filter(u=>u.id!==id);
                        saveData('users',newUsers);
                        users = newUsers;
                        renderUserList();
                        showToast('Đã xóa người dùng');
                    });
                });
            });
            document.querySelectorAll('[data-action="viewOrders"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    let id = parseInt(btn.dataset.id);
                    let user = users.find(u=>u.id===id);
                    let userOrders = orders.filter(o=>o.userId===id);
                    showToast(`${user?.name} có ${userOrders.length} đơn hàng, tổng chi tiêu ${formatCurrency(userOrders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0))}`);
                });
            });
        }
    }
    
    document.getElementById('addUserBtn')?.addEventListener('click',()=>openModal('user',null));
    document.getElementById('exportUserBtn')?.addEventListener('click',()=> exportToCSV(users, 'users.csv'));
    document.getElementById('searchUser')?.addEventListener('input', renderUserList);
    document.getElementById('filterUserRole')?.addEventListener('change', renderUserList);
    renderUserList();
}

// ORDERS
async function renderOrderTable(container) {
    let orders = getData('orders');
    let users = getData('users');
    let products = getData('products');
    
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addOrderBtn"><i class="fas fa-plus"></i> Tạo đơn hàng mới</button>
            <select id="filterOrderStatus">
                <option value="">📋 Tất cả trạng thái</option>
                <option value="pending">⏳ Chờ xử lý</option>
                <option value="processing">🔄 Đang xử lý</option>
                <option value="delivered">✅ Đã giao</option>
                <option value="cancelled">❌ Đã hủy</option>
            </select>
            <input type="month" id="filterOrderMonth" placeholder="Chọn tháng">
            <button class="btn-add" id="exportOrderBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất CSV</button>
        </div>
        <div style="overflow-x:auto">
            <table class="data-table">
                <thead>
                    <tr><th>Mã ĐH</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày đặt</th><th>Thao tác</th></tr>
                </thead>
                <tbody id="orderTableBody"></tbody>
            </table>
        </div>
        <div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 1rem; display: flex; justify-content: space-between; flex-wrap: wrap;">
            <span><i class="fas fa-chart-line"></i> Tổng doanh thu: <strong>${formatCurrency(orders.filter(o=>o.status==='delivered').reduce((s,o)=>s+o.total,0))}</strong></span>
            <span><i class="fas fa-clock"></i> Đơn chờ xử lý: <strong>${orders.filter(o=>o.status==='pending').length}</strong></span>
            <span><i class="fas fa-check-circle"></i> Đã giao thành công: <strong>${orders.filter(o=>o.status==='delivered').length}</strong></span>
        </div>
    `;
    
    function renderOrderList() {
        const statusFilter = document.getElementById('filterOrderStatus')?.value || '';
        const monthFilter = document.getElementById('filterOrderMonth')?.value || '';
        let filtered = orders.filter(o => {
            const matchStatus = !statusFilter || o.status === statusFilter;
            const matchMonth = !monthFilter || o.orderDate.startsWith(monthFilter);
            return matchStatus && matchMonth;
        });
        const tbody = document.getElementById('orderTableBody');
        if(tbody) {
            tbody.innerHTML = filtered.map(o => {
                let userName = users.find(u=>u.id===o.userId)?.name || 'Khách';
                let orderItems = o.items?.map(item => {
                    let product = products.find(p => p.id === item.productId);
                    return `${product?.name || 'SP'} (x${item.qty})`;
                }).join(', ') || 'Chi tiết đơn hàng';
                return `<tr>
                    <td><span class="promotion-badge">#${o.id}</span></td>
                    <td><strong>${userName}</strong><br><small>ID: ${o.userId}</small></td>
                    <td>${orderItems.substring(0, 50)}${orderItems.length > 50 ? '...' : ''}</td>
                    <td><strong style="color:#1a5c4a;">${formatCurrency(o.total)}</strong></td>
                    <td>
                        <select class="status-select" data-id="${o.id}" style="padding:0.3rem;border-radius:1rem;border:1px solid #ddd;">
                            <option value="pending" ${o.status==='pending' ? 'selected' : ''}>⏳ Chờ xử lý</option>
                            <option value="processing" ${o.status==='processing' ? 'selected' : ''}>🔄 Đang xử lý</option>
                            <option value="delivered" ${o.status==='delivered' ? 'selected' : ''}>✅ Đã giao</option>
                            <option value="cancelled" ${o.status==='cancelled' ? 'selected' : ''}>❌ Đã hủy</option>
                        </select>
                    </td>
                    <td>${o.orderDate}</td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${o.id}" data-action="editOrder"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon btn-delete" data-id="${o.id}" data-action="delOrder"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
            
            // Gắn sự kiện cho select thay đổi trạng thái
            document.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', (e) => {
                    let id = parseInt(select.dataset.id);
                    let newStatus = select.value;
                    let ordersList = getData('orders');
                    let order = ordersList.find(o => o.id === id);
                    if(order) {
                        order.status = newStatus;
                        saveData('orders', ordersList);
                        renderOrderList();
                        showToast(`Đã cập nhật trạng thái đơn hàng #${id} thành ${newStatus}`);
                    }
                });
            });
            
            document.querySelectorAll('[data-action="editOrder"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    let id = parseInt(btn.dataset.id);
                    let order = getData('orders').find(o=>o.id===id);
                    openModal('order',order);
                });
            });
            document.querySelectorAll('[data-action="delOrder"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    showConfirm('Xóa đơn hàng', 'Bạn có chắc chắn muốn xóa đơn hàng này?', () => {
                        let id = parseInt(btn.dataset.id);
                        let newOrders = getData('orders').filter(o=>o.id!==id);
                        saveData('orders',newOrders);
                        renderSection('orders');
                        showToast('Đã xóa đơn hàng');
                    });
                });
            });
        }
    }
    
    document.getElementById('addOrderBtn')?.addEventListener('click',()=>openModal('order',null));
    document.getElementById('exportOrderBtn')?.addEventListener('click',()=> exportToCSV(orders, 'orders.csv'));
    document.getElementById('filterOrderStatus')?.addEventListener('change', renderOrderList);
    document.getElementById('filterOrderMonth')?.addEventListener('change', renderOrderList);
    renderOrderList();
}

// REVENUE
async function renderRevenuePage(container) {
    let orders = getData('orders').filter(o=>o.status==='delivered');
    let monthly = {};
    orders.forEach(o=>{
        let month = o.orderDate.slice(0,7);
        monthly[month] = (monthly[month]||0) + o.total;
    });
    let labels = Object.keys(monthly).sort();
    let data = labels.map(l=>monthly[l]);
    
    // Tính doanh thu theo danh mục
    let products = getData('products');
    let cats = getData('categories');
    let categoryRevenue = {};
    orders.forEach(o => {
        if(o.items) {
            o.items.forEach(item => {
                let product = products.find(p => p.id === item.productId);
                if(product) {
                    let cat = cats.find(c => c.id === product.categoryId);
                    let catName = cat?.name || 'Khác';
                    categoryRevenue[catName] = (categoryRevenue[catName] || 0) + (item.qty * product.price);
                }
            });
        }
    });
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
            <div style="background:white; border-radius:1.5rem; padding:1.5rem;">
                <h3>📊 Biểu đồ doanh thu theo tháng</h3>
                <canvas id="revenueChartCanvas" height="250"></canvas>
            </div>
            <div style="background:white; border-radius:1.5rem; padding:1.5rem;">
                <h3>🥇 Doanh thu theo danh mục</h3>
                <canvas id="categoryChartCanvas" height="250"></canvas>
            </div>
        </div>
        <div style="background:white; border-radius:1.5rem; padding:1.5rem; margin-top:1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <h4><i class="fas fa-chart-line"></i> Tổng doanh thu đã giao: <strong style="color:#1a5c4a;">${formatCurrency(orders.reduce((s,o)=>s+o.total,0))}</strong></h4>
                <button class="btn-add" id="exportRevenueBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất báo cáo CSV</button>
            </div>
            <hr style="margin: 1rem 0;">
            <h4>📋 Chi tiết doanh thu theo tháng</h4>
            <table class="data-table">
                <thead><tr><th>Tháng</th><th>Doanh thu</th><th>Tỷ lệ</th></tr></thead>
                <tbody>
                    ${labels.map(l => `<tr>
                        <td>${l}</td>
                        <td><strong>${formatCurrency(monthly[l])}</strong></td>
                        <td>${((monthly[l] / orders.reduce((s,o)=>s+o.total,0)) * 100).toFixed(1)}%</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    setTimeout(()=>{
        let ctx = document.getElementById('revenueChartCanvas')?.getContext('2d');
        if(revenueChart) revenueChart.destroy();
        if(ctx) revenueChart = new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Doanh thu (VND)', data, backgroundColor:'#0f3b2c', borderRadius: 8 }] } });
        
        let categoryCtx = document.getElementById('categoryChartCanvas')?.getContext('2d');
        if(categoryCtx) {
            new Chart(categoryCtx, { 
                type: 'doughnut', 
                data: { 
                    labels: Object.keys(categoryRevenue), 
                    datasets: [{ 
                        data: Object.values(categoryRevenue), 
                        backgroundColor: ['#1a5c4a', '#2d8f73', '#e8b923', '#f5e6b8', '#0c2d26']
                    }] 
                } 
            });
        }
    },100);
    document.getElementById('exportRevenueBtn')?.addEventListener('click',()=> exportToCSV(orders.map(o=>({ id:o.id, total:o.total, date:o.orderDate })), 'revenue_report.csv'));
}

// PROMOTIONS (giữ nguyên)
async function renderPromotionTable(container) {
    let promotions = getData('promotions');
    container.innerHTML = `
        <button class="btn-add" id="addPromotionBtn"><i class="fas fa-plus"></i> Thêm khuyến mãi</button>
        <table class="data-table"><thead><tr><th>ID</th><th>Mã code</th><th>Giảm giá</th><th>Loại</th><th>Ngày bắt đầu</th><th>Ngày kết thúc</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        ${promotions.map(p => `<tr>
            <td>${p.id}</td>
            <td><span class="promotion-badge">${p.code}</span></td>
            <td>${p.type === 'percent' ? p.discount + '%' : formatCurrency(p.discount)}</td>
            <td>${p.type === 'percent' ? 'Phần trăm' : 'Cố định'}</td>
            <td>${p.startDate}</td>
            <td>${p.endDate}</td>
            <td>${p.active ? '<span class="badge-status bg-success">Hoạt động</span>' : '<span class="badge-status bg-warning">Tạm dừng</span>'}</td>
            <td><button class="btn-icon btn-edit" data-id="${p.id}" data-action="editPromo"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-delete" data-id="${p.id}" data-action="delPromo"><i class="fas fa-trash"></i></button>
            <button class="btn-icon" data-id="${p.id}" data-action="togglePromo" style="color:#2d8f73;"><i class="fas fa-power-off"></i></button></td>
        </tr>`).join('')}
        </tbody></table>`;
    
    document.getElementById('addPromotionBtn')?.addEventListener('click',()=>openModal('promotion',null));
    document.querySelectorAll('[data-action="editPromo"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let promo = getData('promotions').find(p=>p.id===id);
            openModal('promotion',promo);
        });
    });
    document.querySelectorAll('[data-action="delPromo"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            showConfirm('Xóa khuyến mãi', 'Bạn có chắc chắn muốn xóa khuyến mãi này?', () => {
                let id = parseInt(btn.dataset.id);
                let newPromos = getData('promotions').filter(p=>p.id!==id);
                saveData('promotions',newPromos);
                renderSection('promotions');
                showToast('Đã xóa khuyến mãi');
            });
        });
    });
    document.querySelectorAll('[data-action="togglePromo"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let promos = getData('promotions');
            let promo = promos.find(p=>p.id===id);
            if(promo) {
                promo.active = !promo.active;
                saveData('promotions',promos);
                renderSection('promotions');
                showToast(`Đã ${promo.active ? 'kích hoạt' : 'tạm dừng'} mã ${promo.code}`);
            }
        });
    });
}

// REVIEWS
async function renderReviewTable(container) {
    let reviews = getData('reviews');
    let products = getData('products');
    let users = getData('users');
    
    container.innerHTML = `
        <div class="filter-bar">
            <select id="filterReviewStatus">
                <option value="">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
            </select>
            <button class="btn-add" id="exportReviewBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất CSV</button>
        </div>
        <table class="data-table"><thead><tr><th>ID</th><th>Sản phẩm</th><th>Người dùng</th><th>Đánh giá</th><th>Nhận xét</th><th>Ngày</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="reviewTableBody"></tbody></table>`;
    
    function renderReviewList() {
        const statusFilter = document.getElementById('filterReviewStatus')?.value || '';
        let filtered = reviews.filter(r => !statusFilter || r.status === statusFilter);
        const tbody = document.getElementById('reviewTableBody');
        if(tbody) {
            tbody.innerHTML = filtered.map(r => {
                let product = products.find(p=>p.id===r.productId);
                let user = users.find(u=>u.id===r.userId);
                return `<tr>
                    <td>${r.id}</td>
                    <td>${product?.name || 'N/A'}</td>
                    <td>${user?.name || 'N/A'}</td>
                    <td><span class="rating-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span> (<strong>${r.rating}</strong>/5)</td>
                    <td>${r.comment.substring(0,50)}${r.comment.length>50?'...':''}</td>
                    <td>${r.date}</td>
                    <td>${r.status === 'approved' ? '<span class="badge-status bg-success">Đã duyệt</span>' : '<span class="badge-status bg-warning">Chờ duyệt</span>'}</td>
                    <td><button class="btn-icon" data-id="${r.id}" data-action="approveReview" style="color:#1a5c4a;"><i class="fas fa-check-circle"></i></button>
                    <button class="btn-icon btn-delete" data-id="${r.id}" data-action="delReview"><i class="fas fa-trash"></i></button></td>
                </tr>`;
            }).join('');
            
            document.querySelectorAll('[data-action="approveReview"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    let id = parseInt(btn.dataset.id);
                    let reviewList = getData('reviews');
                    let review = reviewList.find(r=>r.id===id);
                    if(review) {
                        review.status = 'approved';
                        saveData('reviews',reviewList);
                        renderReviewList();
                        showToast('Đã duyệt đánh giá');
                    }
                });
            });
            document.querySelectorAll('[data-action="delReview"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    showConfirm('Xóa đánh giá', 'Bạn có chắc chắn muốn xóa đánh giá này?', () => {
                        let id = parseInt(btn.dataset.id);
                        let newReviews = getData('reviews').filter(r=>r.id!==id);
                        saveData('reviews',newReviews);
                        reviews = newReviews;
                        renderReviewList();
                        showToast('Đã xóa đánh giá');
                    });
                });
            });
        }
    }
    
    document.getElementById('exportReviewBtn')?.addEventListener('click',()=> exportToCSV(reviews, 'reviews.csv'));
    document.getElementById('filterReviewStatus')?.addEventListener('change', renderReviewList);
    renderReviewList();
}

// SUPPLIERS (giữ nguyên)
async function renderSupplierTable(container) {
    let suppliers = getData('suppliers');
    container.innerHTML = `
        <button class="btn-add" id="addSupplierBtn"><i class="fas fa-plus"></i> Thêm nhà cung cấp</button>
        <table class="data-table"><thead><tr><th>ID</th><th>Tên NCC</th><th>Người liên hệ</th><th>Điện thoại</th><th>Email</th><th>Địa chỉ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        ${suppliers.map(s => `<tr>
            <td>${s.id}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.contact}</td>
            <td>${s.phone}</td>
            <td>${s.email}</td>
            <td>${s.address}</td>
            <td>${s.status === 'active' ? '<span class="badge-status bg-success">Đang hợp tác</span>' : '<span class="badge-status bg-warning">Ngừng hợp tác</span>'}</td>
            <td><button class="btn-icon btn-edit" data-id="${s.id}" data-action="editSupplier"><i class="fas fa-edit"></i></button>
            <button class="btn-icon btn-delete" data-id="${s.id}" data-action="delSupplier"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('')}
        </tbody></table>`;
    
    document.getElementById('addSupplierBtn')?.addEventListener('click',()=>openModal('supplier',null));
    document.querySelectorAll('[data-action="editSupplier"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let supplier = getData('suppliers').find(s=>s.id===id);
            openModal('supplier',supplier);
        });
    });
    document.querySelectorAll('[data-action="delSupplier"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            showConfirm('Xóa nhà cung cấp', 'Bạn có chắc chắn muốn xóa nhà cung cấp này?', () => {
                let id = parseInt(btn.dataset.id);
                let newSuppliers = getData('suppliers').filter(s=>s.id!==id);
                saveData('suppliers',newSuppliers);
                renderSection('suppliers');
                showToast('Đã xóa nhà cung cấp');
            });
        });
    });
}

// IMPORTS (giữ nguyên)
async function renderImportTable(container) {
    let imports = getData('imports');
    let suppliers = getData('suppliers');
    let products = getData('products');
    
    container.innerHTML = `
        <button class="btn-add" id="addImportBtn"><i class="fas fa-plus"></i> Thêm phiếu nhập</button>
        <table class="data-table"><thead><tr><th>ID</th><th>Nhà cung cấp</th><th>Sản phẩm</th><th>Số lượng</th><th>Giá nhập</th><th>Thành tiền</th><th>Ngày nhập</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        ${imports.map(imp => {
            let supplier = suppliers.find(s=>s.id===imp.supplierId);
            let product = products.find(p=>p.id===imp.productId);
            let total = imp.quantity * imp.price;
            return `<tr>
                <td>${imp.id}</td>
                <td>${supplier?.name || 'N/A'}</td>
                <td>${product?.name || 'N/A'}</td>
                <td>${imp.quantity}</td>
                <td>${formatCurrency(imp.price)}</td>
                <td>${formatCurrency(total)}</td>
                <td>${imp.importDate}</td>
                <td>${imp.status === 'completed' ? '<span class="badge-status bg-success">Hoàn thành</span>' : '<span class="badge-status bg-warning">Đang xử lý</span>'}</td>
                <td><button class="btn-icon btn-edit" data-id="${imp.id}" data-action="editImport"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-delete" data-id="${imp.id}" data-action="delImport"><i class="fas fa-trash"></i></button></td>
            </tr>`;
        }).join('')}
        </tbody></table>`;
    
    document.getElementById('addImportBtn')?.addEventListener('click',()=>openModal('import',null));
    document.querySelectorAll('[data-action="editImport"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let importItem = getData('imports').find(i=>i.id===id);
            openModal('import',importItem);
        });
    });
    document.querySelectorAll('[data-action="delImport"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            showConfirm('Xóa phiếu nhập', 'Bạn có chắc chắn muốn xóa phiếu nhập này?', () => {
                let id = parseInt(btn.dataset.id);
                let newImports = getData('imports').filter(i=>i.id!==id);
                saveData('imports',newImports);
                renderSection('imports');
                showToast('Đã xóa phiếu nhập');
            });
        });
    });
}

// MODAL LOGIC
function openModal(type, entity) {
    currentEntityType = type;
    currentEditId = entity?.id || null;
    const modal = document.getElementById('genericModal');
    const titleMap = { 
        category:'Loại sản phẩm', product:'Sản phẩm', user:'Người dùng', order:'Đơn hàng',
        promotion:'Khuyến mãi', supplier:'Nhà cung cấp', import:'Phiếu nhập hàng'
    };
    document.getElementById('modalTitle').innerHTML = entity ? `<i class="fas fa-edit"></i> Chỉnh sửa ${titleMap[type]}` : `<i class="fas fa-plus"></i> Thêm ${titleMap[type]}`;
    let fieldsHtml = '';
    if(type === 'category') fieldsHtml = `<label><i class="fas fa-tag"></i> Tên loại</label><input id="catName" value="${entity?.name||''}" required>`;
    if(type === 'product') {
        let cats = getData('categories');
        fieldsHtml = `<label><i class="fas fa-box"></i> Tên sản phẩm</label><input id="prodName" value="${entity?.name||''}">
        <label><i class="fas fa-dollar-sign"></i> Giá (VND)</label><input id="prodPrice" value="${entity?.price||''}">
        <label><i class="fas fa-tags"></i> Danh mục</label><select id="prodCat">${cats.map(c=>`<option value="${c.id}" ${entity?.categoryId==c.id?'selected':''}>${c.name}</option>`).join('')}</select>
        <label><i class="fas fa-warehouse"></i> Tồn kho</label><input id="prodStock" value="${entity?.stock||0}">
        <label><i class="fas fa-align-left"></i> Mô tả</label><textarea id="prodDesc" rows="3">${entity?.description||''}</textarea>`;
    }
    if(type === 'user') fieldsHtml = `<label><i class="fas fa-user"></i> Họ tên</label><input id="userName" value="${entity?.name||''}"><label><i class="fas fa-envelope"></i> Email</label><input id="userEmail" value="${entity?.email||''}"><label><i class="fas fa-phone"></i> Số điện thoại</label><input id="userPhone" value="${entity?.phone||''}"><label><i class="fas fa-user-tag"></i> Vai trò</label><select id="userRole"><option value="customer">Khách hàng</option><option value="admin">Admin</option></select>`;
    if(type === 'order') {
        let users = getData('users');
        fieldsHtml = `<label><i class="fas fa-user"></i> Người dùng</label><select id="orderUserId">${users.map(u=>`<option value="${u.id}" ${entity?.userId==u.id?'selected':''}>${u.name}</option>`).join('')}</select>
        <label><i class="fas fa-dollar-sign"></i> Tổng tiền</label><input id="orderTotal" value="${entity?.total||''}"><label><i class="fas fa-truck"></i> Trạng thái</label><select id="orderStatus"><option value="pending" ${entity?.status==='pending'?'selected':''}>Chờ xử lý</option><option value="processing" ${entity?.status==='processing'?'selected':''}>Đang xử lý</option><option value="delivered" ${entity?.status==='delivered'?'selected':''}>Đã giao</option><option value="cancelled" ${entity?.status==='cancelled'?'selected':''}>Đã hủy</option></select>
        <label><i class="fas fa-calendar"></i> Ngày đặt</label><input id="orderDate" value="${entity?.orderDate||'2025-03-15'}">`;
    }
    if(type === 'promotion') {
        fieldsHtml = `<label><i class="fas fa-ticket-alt"></i> Mã khuyến mãi</label><input id="promoCode" value="${entity?.code||''}">
        <label><i class="fas fa-percent"></i> Giảm giá</label><input id="promoDiscount" value="${entity?.discount||''}">
        <label><i class="fas fa-chart-simple"></i> Loại giảm</label><select id="promoType"><option value="percent" ${entity?.type==='percent'?'selected':''}>Phần trăm (%)</option><option value="fixed" ${entity?.type==='fixed'?'selected':''}>Cố định (VND)</option></select>
        <label><i class="fas fa-chart-line"></i> Đơn tối thiểu</label><input id="promoMinOrder" value="${entity?.minOrder||0}">
        <label><i class="fas fa-calendar-alt"></i> Ngày bắt đầu</label><input type="date" id="promoStartDate" value="${entity?.startDate||''}">
        <label><i class="fas fa-calendar-check"></i> Ngày kết thúc</label><input type="date" id="promoEndDate" value="${entity?.endDate||''}">`;
    }
    if(type === 'supplier') {
        fieldsHtml = `<label><i class="fas fa-building"></i> Tên nhà cung cấp</label><input id="supplierName" value="${entity?.name||''}">
        <label><i class="fas fa-user-friends"></i> Người liên hệ</label><input id="supplierContact" value="${entity?.contact||''}">
        <label><i class="fas fa-phone-alt"></i> Điện thoại</label><input id="supplierPhone" value="${entity?.phone||''}">
        <label><i class="fas fa-envelope"></i> Email</label><input id="supplierEmail" value="${entity?.email||''}">
        <label><i class="fas fa-map-marker-alt"></i> Địa chỉ</label><input id="supplierAddress" value="${entity?.address||''}">
        <label><i class="fas fa-toggle-on"></i> Trạng thái</label><select id="supplierStatus"><option value="active" ${entity?.status==='active'?'selected':''}>Đang hợp tác</option><option value="inactive" ${entity?.status==='inactive'?'selected':''}>Ngừng hợp tác</option></select>`;
    }
    if(type === 'import') {
        let suppliers = getData('suppliers');
        let products = getData('products');
        fieldsHtml = `<label><i class="fas fa-truck"></i> Nhà cung cấp</label><select id="importSupplier">${suppliers.map(s=>`<option value="${s.id}" ${entity?.supplierId==s.id?'selected':''}>${s.name}</option>`).join('')}</select>
        <label><i class="fas fa-box"></i> Sản phẩm</label><select id="importProduct">${products.map(p=>`<option value="${p.id}" ${entity?.productId==p.id?'selected':''}>${p.name}</option>`).join('')}</select>
        <label><i class="fas fa-sort-amount-up"></i> Số lượng</label><input id="importQuantity" value="${entity?.quantity||''}">
        <label><i class="fas fa-dollar-sign"></i> Giá nhập (VND)</label><input id="importPrice" value="${entity?.price||''}">
        <label><i class="fas fa-calendar"></i> Ngày nhập</label><input type="date" id="importDate" value="${entity?.importDate||''}">`;
    }
    document.getElementById('modalFields').innerHTML = fieldsHtml;
    modal.style.display = 'flex';
}

function closeModal() { 
    document.getElementById('genericModal').style.display = 'none';
    document.getElementById('confirmModal').style.display = 'none';
    if(pendingConfirmCallback) pendingConfirmCallback = null;
}

document.getElementById('modalCloseBtn').addEventListener('click',closeModal);
document.getElementById('confirmNoBtn')?.addEventListener('click',closeModal);
document.getElementById('confirmYesBtn')?.addEventListener('click',()=>{
    if(pendingConfirmCallback) {
        pendingConfirmCallback();
        pendingConfirmCallback = null;
    }
    closeModal();
});

document.getElementById('modalForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    let type = currentEntityType;
    if(type === 'category'){
        let name = document.getElementById('catName').value;
        let cats = getData('categories');
        if(currentEditId){
            let idx = cats.findIndex(c=>c.id===currentEditId);
            if(idx!==-1) cats[idx].name = name;
        } else {
            let newId = Date.now();
            cats.push({id:newId, name, slug: name.toLowerCase().replace(/ /g,'-')});
        }
        saveData('categories',cats);
        showToast(currentEditId ? 'Đã cập nhật loại sản phẩm' : 'Đã thêm loại sản phẩm');
    }
    if(type === 'product'){
        let name = document.getElementById('prodName').value;
        let price = parseInt(document.getElementById('prodPrice').value);
        let categoryId = parseInt(document.getElementById('prodCat').value);
        let stock = parseInt(document.getElementById('prodStock').value);
        let description = document.getElementById('prodDesc')?.value || '';
        let prods = getData('products');
        if(currentEditId){
            let p = prods.find(p=>p.id===currentEditId);
            if(p){ p.name=name; p.price=price; p.categoryId=categoryId; p.stock=stock; p.description=description; }
        } else {
            let newId = Date.now();
            prods.push({id:newId, name, price, categoryId, stock, image:"🏸", description});
        }
        saveData('products',prods);
        showToast(currentEditId ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm');
    }
    if(type === 'user'){
        let name = document.getElementById('userName').value;
        let email = document.getElementById('userEmail').value;
        let phone = document.getElementById('userPhone')?.value || '';
        let role = document.getElementById('userRole').value;
        let users = getData('users');
        if(currentEditId){
            let u = users.find(u=>u.id===currentEditId);
            if(u){ u.name=name; u.email=email; u.phone=phone; u.role=role; }
        } else {
            users.push({id:Date.now(), name, email, phone, role, created_at:new Date().toISOString().slice(0,10)});
        }
        saveData('users',users);
        showToast(currentEditId ? 'Đã cập nhật người dùng' : 'Đã thêm người dùng');
    }
    if(type === 'order'){
        let userId = parseInt(document.getElementById('orderUserId').value);
        let total = parseInt(document.getElementById('orderTotal').value);
        let status = document.getElementById('orderStatus').value;
        let orderDate = document.getElementById('orderDate').value;
        let orders = getData('orders');
        if(currentEditId){
            let o = orders.find(o=>o.id===currentEditId);
            if(o){ o.userId=userId; o.total=total; o.status=status; o.orderDate=orderDate; }
        } else {
            orders.push({id:Date.now(), userId, total, status, orderDate, items:[]});
        }
        saveData('orders',orders);
        showToast(currentEditId ? 'Đã cập nhật đơn hàng' : 'Đã thêm đơn hàng');
    }
    if(type === 'promotion'){
        let code = document.getElementById('promoCode').value;
        let discount = parseInt(document.getElementById('promoDiscount').value);
        let type = document.getElementById('promoType').value;
        let minOrder = parseInt(document.getElementById('promoMinOrder').value);
        let startDate = document.getElementById('promoStartDate').value;
        let endDate = document.getElementById('promoEndDate').value;
        let promos = getData('promotions');
        if(currentEditId){
            let p = promos.find(p=>p.id===currentEditId);
            if(p){ p.code=code; p.discount=discount; p.type=type; p.minOrder=minOrder; p.startDate=startDate; p.endDate=endDate; }
        } else {
            promos.push({id:Date.now(), code, discount, type, startDate, endDate, active: true, minOrder});
        }
        saveData('promotions',promos);
        showToast(currentEditId ? 'Đã cập nhật khuyến mãi' : 'Đã thêm khuyến mãi');
    }
    if(type === 'supplier'){
        let name = document.getElementById('supplierName').value;
        let contact = document.getElementById('supplierContact').value;
        let phone = document.getElementById('supplierPhone').value;
        let email = document.getElementById('supplierEmail').value;
        let address = document.getElementById('supplierAddress').value;
        let status = document.getElementById('supplierStatus').value;
        let suppliers = getData('suppliers');
        if(currentEditId){
            let s = suppliers.find(s=>s.id===currentEditId);
            if(s){ s.name=name; s.contact=contact; s.phone=phone; s.email=email; s.address=address; s.status=status; }
        } else {
            suppliers.push({id:Date.now(), name, contact, phone, email, address, status});
        }
        saveData('suppliers',suppliers);
        showToast(currentEditId ? 'Đã cập nhật nhà cung cấp' : 'Đã thêm nhà cung cấp');
    }
    if(type === 'import'){
        let supplierId = parseInt(document.getElementById('importSupplier').value);
        let productId = parseInt(document.getElementById('importProduct').value);
        let quantity = parseInt(document.getElementById('importQuantity').value);
        let price = parseInt(document.getElementById('importPrice').value);
        let importDate = document.getElementById('importDate').value;
        let imports = getData('imports');
        if(currentEditId){
            let i = imports.find(i=>i.id===currentEditId);
            if(i){ i.supplierId=supplierId; i.productId=productId; i.quantity=quantity; i.price=price; i.importDate=importDate; }
        } else {
            imports.push({id:Date.now(), supplierId, productId, quantity, price, importDate, status: 'completed'});
            // Cập nhật tồn kho sản phẩm
            let products = getData('products');
            let product = products.find(p=>p.id===productId);
            if(product) {
                product.stock += quantity;
                saveData('products',products);
            }
        }
        saveData('imports',imports);
        showToast(currentEditId ? 'Đã cập nhật phiếu nhập' : 'Đã thêm phiếu nhập và cập nhật tồn kho');
    }
    closeModal();
    renderSection(currentSection);
});

// Format tiền tệ helper
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// AUTH
const loginView = document.getElementById('loginView');
const adminApp = document.getElementById('adminApp');
document.getElementById('doLoginBtn').addEventListener('click',()=>{
    let user = document.getElementById('adminUser').value;
    let pass = document.getElementById('adminPass').value;
    if(user === 'admin' && pass === 'admin123'){
        sessionStorage.setItem('adminLogged','true');
        loginView.style.display = 'none';
        adminApp.style.display = 'block';
        renderSection('dashboard');
        showToast('Đăng nhập thành công!');
    } else {
        document.getElementById('loginError').innerText = 'Sai tài khoản hoặc mật khẩu';
    }
});
document.getElementById('logoutAdminBtn').addEventListener('click',()=>{
    sessionStorage.removeItem('adminLogged');
    loginView.style.display = 'flex';
    adminApp.style.display = 'none';
    showToast('Đã đăng xuất');
});
if(sessionStorage.getItem('adminLogged') === 'true'){
    loginView.style.display = 'none';
    adminApp.style.display = 'block';
    renderSection('dashboard');
} else {
    loginView.style.display = 'flex';
    adminApp.style.display = 'none';
}
document.querySelectorAll('.sidebar-menu li').forEach(li=>{
    li.addEventListener('click',()=>{
        let sec = li.dataset.section;
        if(sec) renderSection(sec);
        if(window.innerWidth<768) document.getElementById('sidebar').classList.remove('open');
    });
});
document.getElementById('mobileMenuToggle').addEventListener('click',()=>{
    document.getElementById('sidebar').classList.toggle('open');
});
window.addEventListener('click',(e)=>{
    if(e.target.classList.contains('modal')) closeModal();
});