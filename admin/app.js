// ------------------- KHO DỮ LIỆU LOCALSTORAGE & SEED -------------------
let currentUser = null;
let currentSection = 'dashboard';
let currentEditId = null;
let currentEntityType = null;
let revenueChart = null;
let pendingConfirmCallback = null;

// Khởi tạo dữ liệu mẫu thực tế
function initData() {
    if (!localStorage.getItem('categories')) {
        const cats = [
            { id: 1, name: "Vợt Cầu Lông", slug: "vot-cau-long" },
            { id: 2, name: "Giày Cầu Lông", slug: "giay-cau-long" },
            { id: 3, name: "Trang Phục", slug: "trang-phuc" },
            { id: 4, name: "Phụ Kiện", slug: "phu-kien" },
            { id: 5, name: "Ống Cầu", slug: "ong-cau" }
        ];
        localStorage.setItem('categories', JSON.stringify(cats));
    }
    if (!localStorage.getItem('products')) {
        const products = [
            { id: 1, name: "Yonex Astrox 100ZZ", price: 4250000, stock: 15, categoryId: 1, image: "🏸", description: "Vợt tấn công" },
            { id: 2, name: "Victor Thruster Ryuga II", price: 3800000, stock: 10, categoryId: 1, image: "🏸", description: "Vợt nặng đầu" },
            { id: 3, name: "Giày Yonex 65Z3", price: 2950000, stock: 20, categoryId: 2, image: "👟", description: "Bám sân tốt" }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }
    if (!localStorage.getItem('users')) {
        const users = [
            { id: 1, name: "Nguyễn Văn Admin", email: "admin@triplet.com", phone: "0901234567", role: 'admin' },
            { id: 2, name: "Lê Minh Tú", email: "tu.le@gmail.com", phone: "0912888999", role: 'customer' }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([
            { id: 1001, userId: 2, total: 4250000, status: 'delivered', orderDate: '2026-03-25' }
        ]));
    }
    // MỤC MỚI: Khuyến mãi
    if (!localStorage.getItem('promotions')) {
        localStorage.setItem('promotions', JSON.stringify([
            { id: 1, code: "GIAM20", discount: 20, type: "percent", active: true },
            { id: 2, code: "WELCOME", discount: 50000, type: "fixed", active: true }
        ]));
    }
    // MỤC MỚI: Nhà cung cấp
    if (!localStorage.getItem('suppliers')) {
        localStorage.setItem('suppliers', JSON.stringify([
            { id: 1, name: "Yonex Vietnam", contact: "Anh Hoàng", phone: "0905111222" },
            { id: 2, name: "Đại lý Victor", contact: "Chị Lan", phone: "0905333444" }
        ]));
    }
    // MỤC MỚI: Đánh giá
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([
            { id: 1, productId: 1, userId: 2, rating: 5, comment: "Vợt rất tốt, chính hãng!", status: "approved" }
        ]));
    }
    // MỤC MỚI: Nhập hàng
    if (!localStorage.getItem('imports')) {
        localStorage.setItem('imports', JSON.stringify([
            { id: 1, supplierId: 1, productId: 1, quantity: 10, price: 3500000, date: "2026-03-01" }
        ]));
    }
}
initData();

// --- HELPERS ---
const getData = (e) => JSON.parse(localStorage.getItem(e)) || [];
const saveData = (e, d) => localStorage.setItem(e, JSON.stringify(d));

function showToast(msg, isError = false) {
    const t = document.getElementById('toastNotification');
    if(!t) return;
    t.innerText = msg;
    t.style.background = isError ? '#ef4444' : '#1a5c4a';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

// --- RENDER LOGIC ---
function renderSection(section) {
    currentSection = section;
    const container = document.getElementById('dynamicContent');
    const title = document.getElementById('mainTitle');
    
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.toggle('active', li.dataset.section === section);
    });

    const headers = {
        dashboard: "Tổng quan",
        categories: "Loại sản phẩm",
        products: "Sản phẩm",
        users: "Người dùng",
        orders: "Đơn hàng",
        promotions: "Khuyến mãi",
        reviews: "Đánh giá",
        suppliers: "Nhà cung cấp",
        imports: "Nhập hàng"
    };
    title.innerText = headers[section] || "Quản trị";

    if(section === 'dashboard') renderDashboard(container);
    else renderTable(container, section);
}

function renderTable(container, section) {
    const data = getData(section);
    const tableHeaders = {
        categories: ['ID', 'Tên loại'],
        products: ['Ảnh', 'Tên SP', 'Giá', 'Kho'],
        users: ['Họ tên', 'Liên hệ', 'Vai trò'],
        orders: ['Mã đơn', 'Tổng tiền', 'Ngày', 'Trạng thái'],
        promotions: ['Mã Code', 'Giảm giá', 'Trạng thái'],
        reviews: ['Sản phẩm', 'Đánh giá', 'Nội dung'],
        suppliers: ['Nhà cung cấp', 'Liên hệ', 'SĐT'],
        imports: ['Ngày nhập', 'Sản phẩm', 'Số lượng', 'Giá nhập']
    };

    container.innerHTML = `
        <div class="filter-bar">
            <button class="btn-add" onclick="openModal('${section.replace(/s$/, '')}')"><i class="fas fa-plus"></i> Thêm mới</button>
        </div>
        <table class="data-table">
            <thead><tr>${tableHeaders[section].map(h => `<th>${h}</th>`).join('')}<th>Thao tác</th></tr></thead>
            <tbody>${data.map(item => `<tr>${renderRowCells(section, item)}<td>${renderActions(section, item)}</td></tr>`).join('')}</tbody>
        </table>`;
}

function renderRowCells(section, item) {
    if(section === 'categories') return `<td>${item.id}</td><td><b>${item.name}</b></td>`;
    if(section === 'products') return `<td>${item.image}</td><td><b>${item.name}</b></td><td>${item.price.toLocaleString()}₫</td><td>${item.stock}</td>`;
    if(section === 'users') return `<td><b>${item.name}</b></td><td>${item.email}</td><td>${item.role}</td>`;
    if(section === 'orders') return `<td>#${item.id}</td><td>${item.total.toLocaleString()}₫</td><td>${item.orderDate}</td><td>${item.status}</td>`;
    if(section === 'promotions') return `<td><b>${item.code}</b></td><td>${item.discount}${item.type==='percent'?'%':'₫'}</td><td>${item.active?'Đang chạy':'Tạm dừng'}</td>`;
    if(section === 'reviews') {
        const p = getData('products').find(x => x.id === item.productId);
        return `<td>${p?.name || 'Ẩn'}</td><td>${'⭐'.repeat(item.rating)}</td><td>${item.comment}</td>`;
    }
    if(section === 'suppliers') return `<td><b>${item.name}</b></td><td>${item.contact}</td><td>${item.phone}</td>`;
    if(section === 'imports') {
        const p = getData('products').find(x => x.id === item.productId);
        return `<td>${item.date}</td><td>${p?.name || 'SP'}</td><td>${item.quantity}</td><td>${item.price.toLocaleString()}₫</td>`;
    }
}

function renderActions(section, item) {
    let html = `
        <button class="btn-icon btn-edit" onclick="openModal('${section.replace(/s$/, '')}', ${item.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-delete" onclick="deleteItem('${section}', ${item.id})"><i class="fas fa-trash"></i></button>`;
    if(section === 'orders') html += `<button class="btn-icon" onclick="toggleStatus('orders', ${item.id})"><i class="fas fa-sync"></i></button>`;
    return html;
}

// --- MODAL SYSTEM ---
function openModal(type, id = null) {
    currentEntityType = type;
    currentEditId = id;
    const storageKey = type === 'category' ? 'categories' : type + 's';
    const item = id ? getData(storageKey).find(x => x.id === id) : null;
    
    let fields = '';
    if(type === 'promotion') {
        fields = `<label>Mã Code</label><input id="f1" value="${item?.code||''}" required>
                  <label>Mức giảm</label><input type="number" id="f2" value="${item?.discount||''}" required>
                  <label>Loại</label><select id="f3"><option value="percent">Phần trăm (%)</option><option value="fixed">Số tiền cố định (₫)</option></select>`;
    } else if(type === 'supplier') {
        fields = `<label>Tên nhà cung cấp</label><input id="f1" value="${item?.name||''}" required>
                  <label>Người liên hệ</label><input id="f2" value="${item?.contact||''}">
                  <label>Số điện thoại</label><input id="f3" value="${item?.phone||''}">`;
    } else if(type === 'import') {
        const prods = getData('products');
        const sups = getData('suppliers');
        fields = `<label>Nhà cung cấp</label><select id="f1">${sups.map(s=>`<option value="${s.id}">${s.name}</option>`).join('')}</select>
                  <label>Sản phẩm</label><select id="f2">${prods.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
                  <label>Số lượng</label><input type="number" id="f3" value="${item?.quantity||''}">
                  <label>Giá nhập</label><input type="number" id="f4" value="${item?.price||''}">`;
    } else if(type === 'review') {
        const prods = getData('products');
        fields = `<label>Sản phẩm</label><select id="f1">${prods.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select>
                  <label>Số sao</label><input type="number" id="f2" min="1" max="5" value="${item?.rating||5}">
                  <label>Nội dung</label><textarea id="f3">${item?.comment||''}</textarea>`;
    } else {
        // Giữ nguyên các type cũ: product, user, category...
        if(type === 'category') fields = `<label>Tên loại</label><input id="f1" value="${item?.name||''}" required>`;
        if(type === 'product') {
            const cats = getData('categories');
            fields = `<label>Tên SP</label><input id="f1" value="${item?.name||''}" required>
                      <label>Giá</label><input type="number" id="f2" value="${item?.price||''}">
                      <label>Kho</label><input type="number" id="f3" value="${item?.stock||0}">
                      <label>Loại</label><select id="f4">${cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select>`;
        }
        if(type === 'user') {
            fields = `<label>Họ tên</label><input id="f1" value="${item?.name||''}" required>
                      <label>Email</label><input id="f2" value="${item?.email||''}">
                      <label>Vai trò</label><select id="f3"><option value="customer">Customer</option><option value="admin">Admin</option></select>`;
        }
    }

    document.getElementById('modalFields').innerHTML = fields;
    document.getElementById('modalTitle').innerText = (id ? "Sửa " : "Thêm ") + type;
    document.getElementById('genericModal').style.display = 'flex';
}

document.getElementById('modalForm').onsubmit = function(e) {
    e.preventDefault();
    const storageKey = currentEntityType === 'category' ? 'categories' : currentEntityType + 's';
    let data = getData(storageKey);
    let newItem = currentEditId ? data.find(x => x.id === currentEditId) : { id: Date.now() };

    // Map dữ liệu từ Form vào Object
    if(currentEntityType === 'promotion') {
        newItem.code = document.getElementById('f1').value;
        newItem.discount = parseInt(document.getElementById('f2').value);
        newItem.type = document.getElementById('f3').value;
        newItem.active = true;
    } else if(currentEntityType === 'supplier') {
        newItem.name = document.getElementById('f1').value;
        newItem.contact = document.getElementById('f2').value;
        newItem.phone = document.getElementById('f3').value;
    } else if(currentEntityType === 'import') {
        newItem.supplierId = parseInt(document.getElementById('f1').value);
        newItem.productId = parseInt(document.getElementById('f2').value);
        newItem.quantity = parseInt(document.getElementById('f3').value);
        newItem.price = parseInt(document.getElementById('f4').value);
        newItem.date = new Date().toISOString().split('T')[0];
    } else if(currentEntityType === 'review') {
        newItem.productId = parseInt(document.getElementById('f1').value);
        newItem.rating = parseInt(document.getElementById('f2').value);
        newItem.comment = document.getElementById('f3').value;
        newItem.status = "approved";
    } else if(currentEntityType === 'category') newItem.name = document.getElementById('f1').value;
      else if(currentEntityType === 'product') {
        newItem.name = document.getElementById('f1').value;
        newItem.price = parseInt(document.getElementById('f2').value);
        newItem.stock = parseInt(document.getElementById('f3').value);
        newItem.categoryId = parseInt(document.getElementById('f4').value);
        newItem.image = "🏸";
    }

    if(!currentEditId) data.push(newItem);
    saveData(storageKey, data);
    document.getElementById('genericModal').style.display = 'none';
    renderSection(currentSection);
    showToast("Đã lưu dữ liệu!");
};

window.deleteItem = function(key, id) {
    if(confirm("Xác nhận xóa?")) {
        saveData(key, getData(key).filter(x => x.id !== id));
        renderSection(currentSection);
        showToast("Đã xóa!");
    }
};

// --- AUTH & INIT ---
document.getElementById('doLoginBtn').onclick = () => {
    if(document.getElementById('adminUser').value === 'admin' && document.getElementById('adminPass').value === 'admin123') {
        sessionStorage.setItem('adminLogged', 'true');
        location.reload();
    } else alert("Sai mật khẩu!");
};

if(sessionStorage.getItem('adminLogged') === 'true') {
    document.getElementById('loginView').style.display = 'none';
    document.getElementById('adminApp').style.display = 'block';
    renderSection('dashboard');
}

document.querySelectorAll('.sidebar-menu li').forEach(li => {
    li.onclick = () => renderSection(li.dataset.section);
});

function renderDashboard(container) {
    container.innerHTML = `<div class="stats-grid">
        <div class="stat-card"><h3>${getData('products').length}</h3><p>Sản phẩm</p></div>
        <div class="stat-card"><h3>${getData('orders').length}</h3><p>Đơn hàng</p></div>
        <div class="stat-card"><h3>${getData('users').length}</h3><p>Khách hàng</p></div>
        <div class="stat-card"><h3>${getData('promotions').length}</h3><p>Khuyến mãi</p></div>
    </div>`;
}

document.getElementById('modalCloseBtn').onclick = () => document.getElementById('genericModal').style.display = 'none';