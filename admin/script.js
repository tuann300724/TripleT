// ------------------- KHO DỮ LIỆU LOCALSTORAGE & SEED -------------------
let currentUser = null;
let currentSection = 'dashboard';
let currentEditId = null;
let currentEntityType = null;
let revenueChart = null;
let pendingConfirmCallback = null;

// Khởi tạo dữ liệu mẫu với tên thực tế cụ thể
function initData() {
    if (!localStorage.getItem('categories')) {
        const cats = [
            { id: 1, name: "Vợt Cầu Lông", slug: "vot-cau-long" },
            { id: 2, name: "Giày Cầu Lông", slug: "giay-cau-long" },
            { id: 3, name: "Trang Phục Thi Đấu", slug: "trang-phuc-thi-dau" },
            { id: 4, name: "Phụ Kiện (Quấn cán, vớ)", slug: "phu-kien" },
            { id: 5, name: "Ống Cầu", slug: "ong-cau" },
            { id: 6, name: "Túi & Balo", slug: "tui-balo" }
        ];
        localStorage.setItem('categories', JSON.stringify(cats));
    }

    if (!localStorage.getItem('products')) {
        const products = [
            { id: 1, name: "Yonex Astrox 100ZZ (Kento Momota)", price: 4250000, stock: 15, categoryId: 1, image: "🏸", description: "Vợt tấn công đỉnh cao của Yonex" },
            { id: 2, name: "Victor Thruster Ryuga II", price: 3800000, stock: 10, categoryId: 1, image: "🏸", description: "Vợt nặng đầu, thân cứng" },
            { id: 3, name: "Giày Yonex 65Z3 Khải Huyền", price: 2950000, stock: 20, categoryId: 2, image: "👟", description: "Bám sân cực tốt, êm ái" },
            { id: 4, name: "Áo thi đấu Lining Quốc Phục", price: 450000, stock: 45, categoryId: 3, image: "👕", description: "Thấm hút mồ hôi, co giãn 4 chiều" },
            { id: 5, name: "Ống cầu Yonex AS40 (12 quả)", price: 650000, stock: 50, categoryId: 5, image: "🪶", description: "Cầu bay đầm, siêu bền" },
            { id: 6, name: "Balo Cầu Lông Yonex BA92012", price: 1250000, stock: 8, categoryId: 6, image: "🎒", description: "Chứa được 2 vợt, có ngăn để giày riêng" }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }

    if (!localStorage.getItem('users')) {
        const users = [
            { id: 1, name: "Nguyễn Văn Admin", email: "admin@triplet.com", phone: "0901234567", role: 'admin', created_at: '2024-01-01' },
            { id: 2, name: "Lê Minh Tú", email: "tu.le@gmail.com", phone: "0912888999", role: 'customer', created_at: '2025-02-15' },
            { id: 3, name: "Trần Thu Hà", email: "ha.tran@yahoo.com", phone: "0988777666", role: 'customer', created_at: '2025-03-10' },
            { id: 4, name: "Phạm Quốc Cường", email: "cuong.pham@outlook.com", phone: "0933444555", role: 'customer', created_at: '2025-03-20' },
            { id: 5, name: "Hoàng Văn Thái", email: "thai.hoang@gmail.com", phone: "0909111222", role: 'customer', created_at: '2025-04-01' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }

    if (!localStorage.getItem('orders')) {
        const orders = [
            { id: 1001, userId: 2, total: 4250000, status: 'delivered', orderDate: '2026-01-15', items: [{ productId: 1, qty: 1 }] },
            { id: 1002, userId: 3, total: 2950000, status: 'processing', orderDate: '2026-03-10', items: [{ productId: 3, qty: 1 }] },
            { id: 1003, userId: 4, total: 1100000, status: 'pending', orderDate: '2026-04-02', items: [{ productId: 4, qty: 1 }, { productId: 5, qty: 1 }] },
            { id: 1004, userId: 2, total: 650000, status: 'delivered', orderDate: '2026-02-20', items: [{ productId: 5, qty: 1 }] }
        ];
        localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    if (!localStorage.getItem('promotions')) {
        const promotions = [
            { id: 1, code: "SUMMER30", discount: 30, type: "percent", startDate: "2025-06-01", endDate: "2025-08-31", active: true, minOrder: 300000 },
            { id: 2, code: "FREESHIP", discount: 50000, type: "fixed", startDate: "2025-07-01", endDate: "2025-07-31", active: true, minOrder: 500000 }
        ];
        localStorage.setItem('promotions', JSON.stringify(promotions));
    }
    
    if (!localStorage.getItem('reviews')) {
        const reviews = [
            { id: 1, productId: 1, userId: 2, rating: 5, comment: "Vợt tấn công quá đầm tay, đập cầu cắm!", date: "2026-01-20", status: "approved" },
            { id: 2, productId: 5, userId: 2, rating: 4, comment: "Cầu bền nhưng giá hơi cao", date: "2026-02-25", status: "approved" }
        ];
        localStorage.setItem('reviews', JSON.stringify(reviews));
    }
    
    if (!localStorage.getItem('suppliers')) {
        const suppliers = [
            { id: 1, name: "Tổng kho Yonex Miền Nam", contact: "Anh Bình", phone: "0987654321", email: "kho-yonex@gmail.com", address: "Quận 10, TP.HCM", status: "active" },
            { id: 2, name: "Đại lý Victor Việt Nam", contact: "Chị Hoa", phone: "0978123456", email: "sales@victor.com", address: "Đống Đa, Hà Nội", status: "active" }
        ];
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    }
    
    if (!localStorage.getItem('imports')) {
        const imports = [
            { id: 1, supplierId: 1, productId: 1, quantity: 20, price: 3500000, importDate: "2025-12-10", status: "completed" },
            { id: 2, supplierId: 2, productId: 2, quantity: 15, price: 3100000, importDate: "2026-01-15", status: "completed" }
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
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    pendingConfirmCallback = callback;
    modal.style.display = 'flex';
}

// Xuất dữ liệu ra CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast("Không có dữ liệu để xuất!", true);
        return;
    }
    
    // Thêm BOM để Excel không bị lỗi font Tiếng Việt
    const BOM = "\uFEFF";
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header] || '';
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }
    
    const blob = new Blob([BOM + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất ${filename}`);
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
    document.getElementById('mainTitle').innerText = titleMap[section] || section;
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
    
    const monthlyOrders = {};
    orders.forEach(o => {
        if(o.status === 'delivered') {
            const month = o.orderDate.slice(0,7);
            monthlyOrders[month] = (monthlyOrders[month] || 0) + o.total;
        }
    });
    
    const chartLabels = Object.keys(monthlyOrders).sort().slice(-6);
    const chartData = chartLabels.map(l => monthlyOrders[l]);
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><i class="fas fa-box"></i><h3>${products.length}</h3><p>Sản phẩm</p></div>
            <div class="stat-card"><i class="fas fa-shopping-bag"></i><h3>${orders.length}</h3><p>Đơn hàng</p></div>
            <div class="stat-card"><i class="fas fa-dollar-sign"></i><h3>${totalRevenue.toLocaleString()}₫</h3><p>Doanh thu (đã giao)</p></div>
            <div class="stat-card"><i class="fas fa-users"></i><h3>${users.length}</h3><p>Người dùng</p></div>
            <div class="stat-card"><i class="fas fa-clock"></i><h3>${pendingOrders}</h3><p>Đơn chờ xử lý</p></div>
            <div class="stat-card"><i class="fas fa-gift"></i><h3>${activePromotions}</h3><p>Khuyến mãi đang chạy</p></div>
            <div class="stat-card"><i class="fas fa-star"></i><h3>${avgRating.toFixed(1)}</h3><p>Đánh giá trung bình</p></div>
        </div>
        <div style="background:white; border-radius:1.5rem; padding:1.5rem; margin-bottom:1.5rem; box-shadow: var(--shadow);">
            <h3>📈 Doanh thu các tháng gần nhất</h3>
            <canvas id="miniRevenueChart" height="200"></canvas>
        </div>
        <div style="background:white; border-radius:1.5rem; padding:1.5rem; box-shadow: var(--shadow);">
            <h3>📦 Đơn hàng gần đây</h3>
            <table class="data-table"><thead><tr><th>Mã đơn</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>
            ${orders.slice(-5).reverse().map(o=>`<tr><td>#${o.id}</td><td><b>${o.total.toLocaleString()}₫</b></td><td><span class="badge-status ${o.status==='delivered'?'bg-success':(o.status==='pending'?'bg-warning':'')}">${o.status}</span></td></tr>`).join('')}
            </tbody></table>
        </div>
    `;
    
    setTimeout(() => {
        const ctx = document.getElementById('miniRevenueChart')?.getContext('2d');
        if(ctx) {
            new Chart(ctx, { 
                type: 'line', 
                data: { labels: chartLabels, datasets: [{ label: 'Doanh thu (VND)', data: chartData, borderColor: '#1a5c4a', backgroundColor: 'rgba(26, 92, 74, 0.1)', fill: true, tension: 0.3 }] } 
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
        <table class="data-table"><thead><tr><th>ID</th><th>Tên danh mục</th><th>Thao tác</th></tr></thead><tbody>
        ${cats.map(c=>`<tr><td>${c.id}</td><td><b>${c.name}</b></td><td><button class="btn-icon btn-edit" data-id="${c.id}" data-action="editCat"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-delete" data-id="${c.id}" data-action="delCat"><i class="fas fa-trash"></i></button></td></tr>`).join('')}
        </tbody></table>`;
    
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

// PRODUCTS - TÍNH NĂNG XEM TỒN KHO
async function renderProductTable(container) {
    let products = getData('products');
    let cats = getData('categories');
    
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addProductBtn"><i class="fas fa-plus"></i> Thêm sản phẩm</button>
            <input type="text" id="searchProduct" placeholder="🔍 Tìm tên sản phẩm..." style="padding:0.5rem 1rem;border-radius:2rem;border:1px solid #ddd; width: 250px;">
            <select id="filterCategory">
                <option value="">Tất cả danh mục</option>
                ${cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
            <button class="btn-add" id="exportProductBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất CSV</button>
        </div>
        <div style="overflow-x:auto"><table class="data-table"><thead><tr><th>ID</th><th>Ảnh</th><th>Tên SP</th><th>Giá</th><th>Danh mục</th><th>Tồn kho</th><th>Thao tác</th></tr></thead><tbody id="productTableBody">
        </tbody></table></div>`;
    
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
                return `<tr>
                    <td>${p.id}</td>
                    <td style="font-size: 20px;">${p.image}</td>
                    <td><b>${p.name}</b></td>
                    <td>${p.price.toLocaleString()}₫</td>
                    <td>${catName}</td>
                    <td><span style="color:${p.stock < 10 ? 'red' : 'inherit'}; font-weight: 600;">${p.stock}</span></td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${p.id}" data-action="editProd"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" data-id="${p.id}" data-action="delProd"><i class="fas fa-trash"></i></button>
                        <button class="btn-icon" data-id="${p.id}" data-action="viewStock" style="color:#2d8f73;" title="Xem tình trạng kho"><i class="fas fa-chart-line"></i></button>
                    </td>
                </tr>`;
            }).join('');
            
            document.querySelectorAll('[data-action="editProd"]').forEach(btn=>{
                btn.addEventListener('click', (e) => {
                    let id = parseInt(e.currentTarget.dataset.id);
                    let prod = getData('products').find(p=>p.id===id);
                    openModal('product',prod);
                });
            });
            document.querySelectorAll('[data-action="delProd"]').forEach(btn=>{
                btn.addEventListener('click', (e) => {
                    let id = parseInt(e.currentTarget.dataset.id);
                    showConfirm('Xóa sản phẩm', 'Bạn có chắc chắn muốn xóa sản phẩm này?', () => {
                        let newProds = getData('products').filter(p=>p.id!==id);
                        saveData('products',newProds);
                        products = newProds;
                        renderProductList();
                        showToast('Đã xóa sản phẩm');
                    });
                });
            });
            // TÍNH NĂNG MỚI: Xem trạng thái tồn kho chi tiết
            document.querySelectorAll('[data-action="viewStock"]').forEach(btn=>{
                btn.addEventListener('click', (e) => {
                    let id = parseInt(e.currentTarget.dataset.id);
                    let prod = getData('products').find(p=>p.id===id);
                    let status = prod.stock > 15 ? "Dồi dào" : (prod.stock > 0 ? "Sắp hết" : "Hết hàng");
                    showToast(`Sản phẩm: ${prod.name} | Tồn kho: ${prod.stock} cái (${status})`);
                });
            });
        }
    }
    
    document.getElementById('addProductBtn')?.addEventListener('click',()=>openModal('product',null));
    document.getElementById('exportProductBtn')?.addEventListener('click',()=> exportToCSV(products, 'products.csv'));
    document.getElementById('searchProduct')?.addEventListener('input', renderProductList);
    document.getElementById('filterCategory')?.addEventListener('change', renderProductList);
    renderProductList();
}

// USERS - TÍNH NĂNG XEM LỊCH SỬ ĐƠN HÀNG CHI TIẾT
async function renderUserTable(container) {
    let users = getData('users');
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addUserBtn"><i class="fas fa-plus"></i> Thêm thành viên</button>
            <input type="text" id="searchUser" placeholder="🔍 Tìm theo tên hoặc email..." style="padding:0.5rem 1rem;border-radius:2rem;border:1px solid #ddd; width: 250px;">
            <button class="btn-add" id="exportUserBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất CSV</button>
        </div>
        <table class="data-table"><thead><tr><th>ID</th><th>Họ tên</th><th>Liên hệ (SĐT/Email)</th><th>Vai trò</th><th>Thao tác</th></tr></thead><tbody id="userTableBody"></tbody></table>`;
    
    function renderUserList() {
        const searchTerm = document.getElementById('searchUser')?.value.toLowerCase() || '';
        let filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm) || u.email.toLowerCase().includes(searchTerm));
        const tbody = document.getElementById('userTableBody');
        if(tbody) {
            tbody.innerHTML = filtered.map(u => `<tr>
                <td>${u.id}</td>
                <td><b>${u.name}</b></td>
                <td>${u.phone}<br><small style="color:#666">${u.email}</small></td>
                <td><span class="badge-status ${u.role==='admin'?'bg-success':'bg-warning'}">${u.role}</span></td>
                <td>
                    <button class="btn-icon btn-edit" data-id="${u.id}" data-action="editUser"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" data-id="${u.id}" data-action="delUser"><i class="fas fa-trash"></i></button>
                    <button class="btn-icon" data-id="${u.id}" data-action="viewOrders" style="color:#2d8f73;" title="Xem lịch sử mua hàng"><i class="fas fa-shopping-bag"></i></button>
                </td>
            </tr>`).join('');
            
            document.querySelectorAll('[data-action="editUser"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    let id = parseInt(btn.dataset.id);
                    let user = users.find(u=>u.id===id);
                    openModal('user',user);
                });
            });
            document.querySelectorAll('[data-action="delUser"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    showConfirm('Xóa người dùng', 'Bạn có chắc chắn muốn xóa thành viên này?', () => {
                        let id = parseInt(btn.dataset.id);
                        let newUsers = users.filter(u=>u.id!==id);
                        saveData('users',newUsers);
                        users = newUsers;
                        renderUserList();
                        showToast('Đã xóa thành viên');
                    });
                });
            });
            // TÍNH NĂNG MỚI: Hiển thị danh sách các mã đơn hàng khách đã mua
            document.querySelectorAll('[data-action="viewOrders"]').forEach(btn=>{
                btn.addEventListener('click',()=>{
                    let id = parseInt(btn.dataset.id);
                    let userOrders = getData('orders').filter(o=>o.userId===id);
                    if(userOrders.length > 0) {
                        let listIds = userOrders.map(o => `#${o.id} (${o.status})`).join(', ');
                        alert(`Khách hàng có ${userOrders.length} đơn hàng.\nChi tiết: ${listIds}`);
                    } else {
                        showToast(`Khách hàng này chưa có đơn hàng nào.`);
                    }
                });
            });
        }
    }
    
    document.getElementById('addUserBtn')?.addEventListener('click',()=>openModal('user',null));
    document.getElementById('exportUserBtn')?.addEventListener('click',()=> exportToCSV(users, 'users.csv'));
    document.getElementById('searchUser')?.addEventListener('input', renderUserList);
    renderUserList();
}

// ORDERS - TÍNH NĂNG ĐỔI TRẠNG THÁI NHANH
async function renderOrderTable(container) {
    let orders = getData('orders');
    let users = getData('users');
    
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addOrderBtn"><i class="fas fa-plus"></i> Tạo đơn hàng thủ công</button>
            <select id="filterOrderStatus">
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
            </select>
            <button class="btn-add" id="exportOrderBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất CSV</button>
        </div>
        <table class="data-table"><thead><tr><th>Mã Đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Ngày đặt</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody id="orderTableBody"></tbody></table>`;
    
    function renderOrderList() {
        const statusFilter = document.getElementById('filterOrderStatus')?.value || '';
        let filtered = orders.filter(o => !statusFilter || o.status === statusFilter);
        // Sắp xếp đơn hàng mới nhất lên trên
        filtered.sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate));
        
        const tbody = document.getElementById('orderTableBody');
        if(tbody) {
            tbody.innerHTML = filtered.map(o => {
                let userName = users.find(u=>u.id===o.userId)?.name || 'Khách vãng lai';
                let badgeClass = o.status==='delivered' ? 'bg-success' : (o.status==='pending' ? 'bg-warning' : '');
                
                return `<tr>
                    <td><b>#${o.id}</b></td>
                    <td>${userName}</td>
                    <td><b>${o.total.toLocaleString()}₫</b></td>
                    <td>${o.orderDate}</td>
                    <td><span class="badge-status ${badgeClass}">${o.status}</span></td>
                    <td>
                        <button class="btn-icon btn-edit" data-id="${o.id}" data-action="editOrder"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" data-id="${o.id}" data-action="delOrder"><i class="fas fa-trash"></i></button>
                        <button class="btn-icon" data-id="${o.id}" data-action="updateStatus" style="color:#2d8f73;" title="Chuyển đổi trạng thái"><i class="fas fa-sync-alt"></i></button>
                    </td>
                </tr>`;
            }).join('');
            attachOrderActions();
        }
    }
    
    document.getElementById('addOrderBtn')?.addEventListener('click',()=>openModal('order',null));
    document.getElementById('exportOrderBtn')?.addEventListener('click',()=> exportToCSV(orders, 'orders.csv'));
    document.getElementById('filterOrderStatus')?.addEventListener('change', renderOrderList);
    renderOrderList();
}

function attachOrderActions(){
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
    // TÍNH NĂNG MỚI: Click để đổi vòng lặp trạng thái
    document.querySelectorAll('[data-action="updateStatus"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let orders = getData('orders');
            let order = orders.find(o=>o.id===id);
            if(order) {
                const statusFlow = { pending: 'processing', processing: 'delivered', delivered: 'cancelled', cancelled: 'pending' };
                order.status = statusFlow[order.status] || 'pending';
                saveData('orders',orders);
                renderSection('orders');
                showToast(`Đã chuyển đơn hàng #${id} sang: ${order.status}`);
            }
        });
    });
}

// CÁC MỤC KHÁC (Giữ nguyên cấu trúc xịn xò của bạn)
async function renderRevenuePage(container) {
    let orders = getData('orders').filter(o=>o.status==='delivered');
    let monthly = {};
    orders.forEach(o=>{
        let month = o.orderDate.slice(0,7);
        monthly[month] = (monthly[month]||0) + o.total;
    });
    let labels = Object.keys(monthly).sort();
    let data = labels.map(l=>monthly[l]);
    container.innerHTML = `<div style="background:white; border-radius:1.5rem; padding:1.5rem; box-shadow: var(--shadow);">
        <h3>📊 Biểu đồ doanh thu theo tháng</h3><canvas id="revenueChartCanvas" height="250"></canvas>
        <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid #ddd;">
            <h4 style="color: var(--green-dark);">Tổng doanh thu thực tế (đã giao): <span style="color: var(--green); font-size: 1.5rem;">${orders.reduce((s,o)=>s+o.total,0).toLocaleString()}₫</span></h4>
        </div>
        <button class="btn-add" id="exportRevenueBtn" style="background:#e8b923;color:#0c2d26;margin-top:1rem;"><i class="fas fa-download"></i> Xuất báo cáo CSV</button>
    </div>`;
    
    setTimeout(()=>{
        let ctx = document.getElementById('revenueChartCanvas')?.getContext('2d');
        if(revenueChart) revenueChart.destroy();
        if(ctx) revenueChart = new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Doanh thu (VND)', data, backgroundColor:'#2d8f73', borderRadius: 5 }] } });
    },100);
    document.getElementById('exportRevenueBtn')?.addEventListener('click',()=> exportToCSV(orders.map(o=>({ id:o.id, total:o.total, date:o.orderDate })), 'revenue_report.csv'));
}

async function renderPromotionTable(container) { /* Giữ nguyên logic của bạn */ }
async function renderReviewTable(container) { /* Giữ nguyên logic của bạn */ }
async function renderSupplierTable(container) { /* Giữ nguyên logic của bạn */ }
async function renderImportTable(container) { /* Giữ nguyên logic của bạn */ }

// MODAL LOGIC (Dữ nguyên hệ thống Modal chuyên nghiệp của bạn)
function openModal(type, entity) {
    currentEntityType = type;
    currentEditId = entity?.id || null;
    const modal = document.getElementById('genericModal');
    const titleMap = { 
        category:'Loại sản phẩm', product:'Sản phẩm', user:'Người dùng', order:'Đơn hàng',
        promotion:'Khuyến mãi', supplier:'Nhà cung cấp', import:'Phiếu nhập hàng'
    };
    document.getElementById('modalTitle').innerText = entity ? `Chỉnh sửa ${titleMap[type]}` : `Thêm mới ${titleMap[type]}`;
    
    let fieldsHtml = '';
    if(type === 'category') fieldsHtml = `<label>Tên danh mục</label><input id="catName" value="${entity?.name||''}" required>`;
    if(type === 'product') {
        let cats = getData('categories');
        fieldsHtml = `<label>Tên sản phẩm</label><input id="prodName" value="${entity?.name||''}" required>
        <label>Giá (VND)</label><input type="number" id="prodPrice" value="${entity?.price||''}" required>
        <label>Danh mục</label><select id="prodCat">${cats.map(c=>`<option value="${c.id}" ${entity?.categoryId==c.id?'selected':''}>${c.name}</option>`).join('')}</select>
        <label>Tồn kho</label><input type="number" id="prodStock" value="${entity?.stock||0}">
        <label>Mô tả / Ảnh Icon</label><textarea id="prodDesc" placeholder="Nhập mô tả hoặc icon emoji...">${entity?.description||''}</textarea>`;
    }
    if(type === 'user') {
        fieldsHtml = `<label>Họ tên</label><input id="userName" value="${entity?.name||''}" required>
        <label>Số điện thoại</label><input id="userPhone" value="${entity?.phone||''}">
        <label>Email</label><input id="userEmail" value="${entity?.email||''}" type="email">
        <label>Vai trò</label><select id="userRole"><option value="customer" ${entity?.role==='customer'?'selected':''}>Khách hàng</option><option value="admin" ${entity?.role==='admin'?'selected':''}>Quản trị viên (Admin)</option></select>`;
    }
    if(type === 'order') {
        let users = getData('users');
        fieldsHtml = `<label>Khách hàng</label><select id="orderUserId">${users.map(u=>`<option value="${u.id}" ${entity?.userId==u.id?'selected':''}>${u.name}</option>`).join('')}</select>
        <label>Tổng tiền thanh toán</label><input type="number" id="orderTotal" value="${entity?.total||''}" required>
        <label>Trạng thái</label><select id="orderStatus">
            <option value="pending" ${entity?.status==='pending'?'selected':''}>Chờ xử lý</option>
            <option value="processing" ${entity?.status==='processing'?'selected':''}>Đang xử lý</option>
            <option value="delivered" ${entity?.status==='delivered'?'selected':''}>Đã giao</option>
            <option value="cancelled" ${entity?.status==='cancelled'?'selected':''}>Đã hủy</option>
        </select>
        <label>Ngày đặt hàng</label><input type="date" id="orderDate" value="${entity?.orderDate||new Date().toISOString().split('T')[0]}">`;
    }
    // Form HTML cho các mục khác nếu cần (promotions, suppliers...) 
    
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
            cats.push({id:Date.now(), name, slug: name.toLowerCase().replace(/ /g,'-')});
        }
        saveData('categories',cats);
        showToast('Đã lưu danh mục thành công');
    }
    else if(type === 'product'){
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
            prods.push({id:Date.now(), name, price, categoryId, stock, image:"🏸", description});
        }
        saveData('products',prods);
        showToast('Đã lưu sản phẩm thành công');
    }
    else if(type === 'user'){
        let name = document.getElementById('userName').value;
        let email = document.getElementById('userEmail').value;
        let phone = document.getElementById('userPhone').value;
        let role = document.getElementById('userRole').value;
        let users = getData('users');
        if(currentEditId){
            let u = users.find(u=>u.id===currentEditId);
            if(u){ u.name=name; u.email=email; u.phone=phone; u.role=role; }
        } else {
            users.push({id:Date.now(), name, email, phone, role, created_at:new Date().toISOString().slice(0,10)});
        }
        saveData('users',users);
        showToast('Đã lưu người dùng thành công');
    }
    else if(type === 'order'){
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
        showToast('Đã lưu đơn hàng thành công');
    }

    closeModal();
    renderSection(currentSection);
});

// AUTH - ĐĂNG NHẬP (Giữ nguyên)
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
async function renderRevenuePage(container) {
    let orders = getData('orders').filter(o=>o.status==='delivered');
    let monthly = {};
    orders.forEach(o=>{
        let month = o.orderDate.slice(0,7);
        monthly[month] = (monthly[month]||0) + o.total;
    });
    let labels = Object.keys(monthly).sort();
    let data = labels.map(l=>monthly[l]);

    container.innerHTML = `
        <div style="background:white; border-radius:1.5rem; padding:1.5rem; box-shadow: var(--shadow); max-width: 900px; margin: auto;">
            <h3 style="margin-bottom: 20px;">📊 Phân tích doanh thu tháng</h3>
            <div style="height: 350px; width: 100%;">
                <canvas id="revenueChartCanvas"></canvas>
            </div>
            <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid #eee; display:flex; justify-content: space-between; align-items: center;">
                <h4 style="color: var(--green-dark);">Tổng thực nhận: <span style="color: var(--green); font-size: 1.4rem;">${orders.reduce((s,o)=>s+o.total,0).toLocaleString()}₫</span></h4>
                <button class="btn-add" id="exportRevenueBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất báo cáo</button>
            </div>
        </div>`;
    
    setTimeout(()=>{
        let ctx = document.getElementById('revenueChartCanvas')?.getContext('2d');
        if(revenueChart) revenueChart.destroy();
        if(ctx) revenueChart = new Chart(ctx, { 
            type:'bar', 
            data:{ labels, datasets:[{ label:'Doanh thu', data, backgroundColor:'#2d8f73', borderRadius: 8, barThickness: 40 }] }, // Tăng barThickness để cột nhỏ lại
            options: { 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
            }
        });
    },100);
    document.getElementById('exportRevenueBtn')?.addEventListener('click',()=> exportToCSV(orders, 'doanh-thu.csv'));
}
async function renderPromotionTable(container) {
    let promos = getData('promotions');
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addPromoBtn"><i class="fas fa-plus"></i> Tạo mã mới</button>
        </div>
        <table class="data-table"><thead><tr><th>Mã code</th><th>Giảm</th><th>Hạn dùng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        ${promos.map(p => {
            const isExpired = new Date(p.endDate) < new Date();
            return `<tr>
                <td><b style="color:var(--green)">${p.code}</b></td>
                <td>${p.type==='percent' ? p.discount+'%' : p.discount.toLocaleString()+'₫'}</td>
                <td>${p.startDate} → ${p.endDate}</td>
                <td><span class="badge-status ${p.active && !isExpired ? 'bg-success' : 'bg-warning'}">${isExpired ? 'Hết hạn' : (p.active ? 'Đang chạy' : 'Tạm dừng')}</span></td>
                <td>
                    <button class="btn-icon" onclick="showToast('Mã ${p.code} đang áp dụng cho đơn trên ${p.minOrder.toLocaleString()}₫')"><i class="fas fa-info-circle"></i></button>
                    <button class="btn-icon btn-delete" onclick="showConfirm('Xóa mã','Bạn có muốn xóa mã này?',()=>{})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`}).join('')}
        </tbody></table>`;
}
async function renderReviewTable(container) {
    let reviews = getData('reviews');
    let products = getData('products');
    container.innerHTML = `
        <table class="data-table"><thead><tr><th>Sản phẩm</th><th>Rating</th><th>Nội dung</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        ${reviews.map(r => {
            let pName = products.find(p=>p.id===r.productId)?.name || 'Ẩn danh';
            return `<tr>
                <td><small>${pName}</small></td>
                <td style="color:#f1c40f">${'★'.repeat(r.rating)}</td>
                <td><i>"${r.comment}"</i></td>
                <td><span class="badge-status ${r.status==='approved'?'bg-success':''}">${r.status}</span></td>
                <td>
                    <button class="btn-icon" style="color:var(--green)" title="Duyệt"><i class="fas fa-check-circle"></i></button>
                    <button class="btn-icon" style="color:red" title="Ẩn"><i class="fas fa-eye-slash"></i></button>
                </td>
            </tr>`}).join('')}
        </tbody></table>`;
}
async function renderRevenuePage(container) {
    let orders = getData('orders').filter(o=>o.status==='delivered');
    let monthly = {};
    orders.forEach(o=>{
        let month = o.orderDate.slice(0,7);
        monthly[month] = (monthly[month]||0) + o.total;
    });
    let labels = Object.keys(monthly).sort();
    let data = labels.map(l=>monthly[l]);

    container.innerHTML = `
        <div style="background:white; border-radius:1.5rem; padding:1.5rem; box-shadow: var(--shadow); max-width: 900px; margin: auto;">
            <h3 style="margin-bottom: 20px;">📊 Phân tích doanh thu tháng</h3>
            <div style="height: 350px; width: 100%;">
                <canvas id="revenueChartCanvas"></canvas>
            </div>
            <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid #eee; display:flex; justify-content: space-between; align-items: center;">
                <h4 style="color: var(--green-dark);">Tổng thực nhận: <span style="color: var(--green); font-size: 1.4rem;">${orders.reduce((s,o)=>s+o.total,0).toLocaleString()}₫</span></h4>
                <button class="btn-add" id="exportRevenueBtn" style="background:#e8b923;color:#0c2d26;"><i class="fas fa-download"></i> Xuất báo cáo</button>
            </div>
        </div>`;
    
    setTimeout(()=>{
        let ctx = document.getElementById('revenueChartCanvas')?.getContext('2d');
        if(revenueChart) revenueChart.destroy();
        if(ctx) revenueChart = new Chart(ctx, { 
            type:'bar', 
            data:{ labels, datasets:[{ label:'Doanh thu', data, backgroundColor:'#2d8f73', borderRadius: 8, barThickness: 40 }] }, // Tăng barThickness để cột nhỏ lại
            options: { 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
            }
        });
    },100);
    document.getElementById('exportRevenueBtn')?.addEventListener('click',()=> exportToCSV(orders, 'doanh-thu.csv'));
}
async function renderPromotionTable(container) {
    let promos = getData('promotions');
    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" id="addPromoBtn"><i class="fas fa-plus"></i> Tạo mã mới</button>
        </div>
        <table class="data-table"><thead><tr><th>Mã code</th><th>Giảm</th><th>Hạn dùng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        ${promos.map(p => {
            const isExpired = new Date(p.endDate) < new Date();
            return `<tr>
                <td><b style="color:var(--green)">${p.code}</b></td>
                <td>${p.type==='percent' ? p.discount+'%' : p.discount.toLocaleString()+'₫'}</td>
                <td>${p.startDate} → ${p.endDate}</td>
                <td><span class="badge-status ${p.active && !isExpired ? 'bg-success' : 'bg-warning'}">${isExpired ? 'Hết hạn' : (p.active ? 'Đang chạy' : 'Tạm dừng')}</span></td>
                <td>
                    <button class="btn-icon" onclick="showToast('Mã ${p.code} đang áp dụng cho đơn trên ${p.minOrder.toLocaleString()}₫')"><i class="fas fa-info-circle"></i></button>
                    <button class="btn-icon btn-delete" onclick="showConfirm('Xóa mã','Bạn có muốn xóa mã này?',()=>{})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`}).join('')}
        </tbody></table>`;
}
async function renderReviewTable(container) {
    let reviews = getData('reviews');
    let products = getData('products');
    container.innerHTML = `
        <table class="data-table"><thead><tr><th>Sản phẩm</th><th>Rating</th><th>Nội dung</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        ${reviews.map(r => {
            let pName = products.find(p=>p.id===r.productId)?.name || 'Ẩn danh';
            return `<tr>
                <td><small>${pName}</small></td>
                <td style="color:#f1c40f">${'★'.repeat(r.rating)}</td>
                <td><i>"${r.comment}"</i></td>
                <td><span class="badge-status ${r.status==='approved'?'bg-success':''}">${r.status}</span></td>
                <td>
                    <button class="btn-icon" style="color:var(--green)" title="Duyệt"><i class="fas fa-check-circle"></i></button>
                    <button class="btn-icon" style="color:red" title="Ẩn"><i class="fas fa-eye-slash"></i></button>
                </td>
            </tr>`}).join('')}
        </tbody></table>`;
}
async function renderSupplierTable(container) {
    let suppliers = getData('suppliers');
    container.innerHTML = `
        <div class="filter-bar"><button class="btn-add"><i class="fas fa-plus"></i> Thêm NCC</button></div>
        <table class="data-table"><thead><tr><th>Nhà cung cấp</th><th>Liên hệ</th><th>Địa chỉ</th><th>Thao tác</th></tr></thead><tbody>
        ${suppliers.map(s => `<tr>
            <td><b>${s.name}</b></td>
            <td>${s.contact}<br><small>${s.phone}</small></td>
            <td><small>${s.address}</small></td>
            <td>
                <a href="tel:${s.phone}" class="btn-icon" style="color:#2980b9"><i class="fas fa-phone"></i></a>
                <button class="btn-icon btn-edit"><i class="fas fa-edit"></i></button>
            </tr>`).join('')}
        </tbody></table>`;
}
async function renderImportTable(container) {
    let imports = getData('imports');
    let products = getData('products');
    let totalImport = imports.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    container.innerHTML = `
        <div style="margin-bottom:15px; padding:10px; background:#f8fdfb; border-left:4px solid var(--green); border-radius:4px;">
            <b>Tổng vốn đã nhập hàng:</b> <span style="color:red">${totalImport.toLocaleString()}₫</span>
        </div>
        <table class="data-table"><thead><tr><th>Ngày nhập</th><th>Sản phẩm</th><th>SL</th><th>Giá nhập</th><th>Thành tiền</th></tr></thead><tbody>
        ${imports.map(i => {
            let pName = products.find(p=>p.id===i.productId)?.name || 'Không xác định';
            return `<tr>
                <td>${i.importDate}</td>
                <td><b>${pName}</b></td>
                <td>${i.quantity}</td>
                <td>${i.price.toLocaleString()}₫</td>
                <td><b>${(i.price * i.quantity).toLocaleString()}₫</b></td>
            </tr>`}).join('')}
        </tbody></table>`;
}

