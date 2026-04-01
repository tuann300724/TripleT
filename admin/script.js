// ------------------- KHO DỮ LIỆU LOCALSTORAGE & SEED -------------------
let currentUser = null;
let currentSection = 'dashboard';
let currentEditId = null;
let currentEntityType = null;
let revenueChart = null;

// Khởi tạo dữ liệu mẫu
function initData() {
    if (!localStorage.getItem('categories')) {
        const cats = [
            "Vợt cầu lông","Cầu lông","Giày cầu lông","Áo thi đấu","Phụ kiện","Túi đựng","Băng vợt","Balo","Dây giày","Phụ kiện điện tử"
        ].map((name,idx) => ({ id: idx+1, name, slug: name.toLowerCase().replace(/ /g,'-') }));
        localStorage.setItem('categories', JSON.stringify(cats));
    }
    if (!localStorage.getItem('products')) {
        let products = [];
        for(let i=1;i<=12;i++) {
            let catId = (i%5)+1;
            products.push({
                id: i, name: `Vợt cầu lông cao cấp ${i}`, price: 890000 + i*50000, stock: 10+i,
                categoryId: catId, image: "🏸", description: "Sản phẩm chất lượng cao"
            });
        }
        products.push({id:13, name:"Cầu lông siêu bền", price:180000, stock:50, categoryId:2, image:"🪶"});
        products.push({id:14, name:"Giày Yonex 65Z", price:1850000, stock:8, categoryId:3, image:"👟"});
        products.push({id:15, name:"Áo thun cầu lông", price:450000, stock:25, categoryId:4, image:"👕"});
        localStorage.setItem('products', JSON.stringify(products));
    }
    if (!localStorage.getItem('news')) {
        let news = [];
        for(let i=1;i<=12;i++) news.push({ id:i, title:`Mẹo chọn vợt cho người mới ${i}`, content:`Nội dung chi tiết ${i}...`, date:`2025-0${(i%12)+1}-10` });
        localStorage.setItem('news', JSON.stringify(news));
    }
    if (!localStorage.getItem('users')) {
        let users = [];
        for(let i=1;i<=12;i++) users.push({ id:i, name:`Người dùng ${i}`, email:`user${i}@email.com`, phone:`09${i}123456`, role: i===1?'admin':'customer', created_at:'2024-01-01' });
        localStorage.setItem('users', JSON.stringify(users));
    }
    if (!localStorage.getItem('orders')) {
        let orders = [];
        let statuses = ['pending','processing','delivered','cancelled'];
        for(let i=1;i<=12;i++) {
            let total = 350000 + i*120000;
            orders.push({
                id:i, userId: (i%10)+1, total: total, status: statuses[i%4],
                orderDate: `2025-0${(i%12)+1}-15`, items: [{ productId:i, qty:1 }]
            });
        }
        localStorage.setItem('orders', JSON.stringify(orders));
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

// Render động theo section
async function renderSection(section) {
    currentSection = section;
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        if(li.dataset.section === section) li.classList.add('active');
        else li.classList.remove('active');
    });
    const titleMap = {
        dashboard:'Tổng quan', categories:'Loại sản phẩm', products:'Sản phẩm',
        news:'Tin tức', users:'Quản lý người dùng', orders:'Đơn hàng', revenue:'Phân tích doanh thu'
    };
    document.getElementById('mainTitle').innerText = titleMap[section] || section;
    const container = document.getElementById('dynamicContent');
    if(section === 'dashboard') await renderDashboard(container);
    else if(section === 'categories') await renderCategoryTable(container);
    else if(section === 'products') await renderProductTable(container);
    else if(section === 'news') await renderNewsTable(container);
    else if(section === 'users') await renderUserTable(container);
    else if(section === 'orders') await renderOrderTable(container);
    else if(section === 'revenue') await renderRevenuePage(container);
}

// DASHBOARD
async function renderDashboard(container) {
    const products = getData('products');
    const orders = getData('orders');
    const users = getData('users');
    const totalRevenue = orders.reduce((sum,o)=> o.status==='delivered'? sum+o.total:sum,0);
    const pendingOrders = orders.filter(o=>o.status==='pending').length;
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><i class="fas fa-box"></i><h3>${products.length}</h3><p>Sản phẩm</p></div>
            <div class="stat-card"><i class="fas fa-shopping-bag"></i><h3>${orders.length}</h3><p>Đơn hàng</p></div>
            <div class="stat-card"><i class="fas fa-dollar-sign"></i><h3>${totalRevenue.toLocaleString()}₫</h3><p>Doanh thu (đã giao)</p></div>
            <div class="stat-card"><i class="fas fa-users"></i><h3>${users.length}</h3><p>Người dùng</p></div>
            <div class="stat-card"><i class="fas fa-clock"></i><h3>${pendingOrders}</h3><p>Đơn chờ xử lý</p></div>
        </div>
        <div style="background:white; border-radius:1.5rem; padding:1.5rem;"><h3>📦 Đơn hàng gần đây</h3><table class="data-table"><thead><tr><th>ID</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>
        ${orders.slice(0,5).map(o=>`<tr><td>#${o.id}</td><td>${o.total.toLocaleString()}₫</td><td>${o.status}</td></tr>`).join('')}
        </tbody></table></div>
    `;
}

// CATEGORIES
async function renderCategoryTable(container) {
    let cats = getData('categories');
    container.innerHTML = `<button class="btn-add" id="addCategoryBtn"><i class="fas fa-plus"></i> Thêm loại SP</button>
    <table class="data-table"><thead><tr><th>ID</th><th>Tên loại</th><th>Thao tác</th></tr></thead><tbody>
    ${cats.map(c=>`<tr><td>${c.id}</td><td>${c.name}</td><td><button class="btn-icon btn-edit" data-id="${c.id}" data-action="editCat"><i class="fas fa-edit"></i></button>
    <button class="btn-icon btn-delete" data-id="${c.id}" data-action="delCat"><i class="fas fa-trash"></i></button></td></tr>`).join('')}
    </tbody></table>`;
    document.getElementById('addCategoryBtn')?.addEventListener('click',()=> openModal('category',null));
    document.querySelectorAll('[data-action="editCat"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let cat = getData('categories').find(c=>c.id===id);
            openModal('category',cat);
        });
    });
    document.querySelectorAll('[data-action="delCat"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            if(confirm('Xóa loại sản phẩm? Sản phẩm liên quan sẽ bị ảnh hưởng')) {
                let id = parseInt(btn.dataset.id);
                let newCats = getData('categories').filter(c=>c.id!==id);
                saveData('categories',newCats);
                renderCategoryTable(container);
            }
        });
    });
}

// PRODUCTS
async function renderProductTable(container) {
    let products = getData('products');
    let cats = getData('categories');
    container.innerHTML = `<button class="btn-add" id="addProductBtn"><i class="fas fa-plus"></i> Thêm sản phẩm</button>
    <div style="overflow-x:auto"><table class="data-table"><thead><tr><th>ID</th><th>Tên SP</th><th>Giá</th><th>Danh mục</th><th>Tồn kho</th><th>Thao tác</th></tr></thead><tbody>
    ${products.map(p=>{
        let catName = cats.find(c=>c.id===p.categoryId)?.name || 'Khác';
        return `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.price.toLocaleString()}₫</td><td>${catName}</td><td>${p.stock}</td>
        <td><button class="btn-icon btn-edit" data-id="${p.id}" data-action="editProd"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-delete" data-id="${p.id}" data-action="delProd"><i class="fas fa-trash"></i></button></td></tr>`;
    }).join('')}
    </tbody></table></div>`;
    document.getElementById('addProductBtn')?.addEventListener('click',()=>openModal('product',null));
    document.querySelectorAll('[data-action="editProd"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let prod = getData('products').find(p=>p.id===id);
            openModal('product',prod);
        });
    });
    document.querySelectorAll('[data-action="delProd"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            if(confirm('Xóa sản phẩm?')){
                let id = parseInt(btn.dataset.id);
                let newProds = getData('products').filter(p=>p.id!==id);
                saveData('products',newProds);
                renderProductTable(container);
            }
        });
    });
}

// NEWS
async function renderNewsTable(container) {
    let news = getData('news');
    container.innerHTML = `<button class="btn-add" id="addNewsBtn"><i class="fas fa-plus"></i> Thêm tin tức</button>
    <table class="data-table"><thead><tr><th>ID</th><th>Tiêu đề</th><th>Ngày</th><th>Thao tác</th></tr></thead><tbody>
    ${news.map(n=>`<tr><td>${n.id}</td><td>${n.title}</td><td>${n.date}</td><td><button class="btn-icon btn-edit" data-id="${n.id}" data-action="editNews"><i class="fas fa-edit"></i></button>
    <button class="btn-icon btn-delete" data-id="${n.id}" data-action="delNews"><i class="fas fa-trash"></i></button></td></tr>`).join('')}
    </tbody></table>`;
    document.getElementById('addNewsBtn')?.addEventListener('click',()=>openModal('news',null));
    attachNewsActions();
}
function attachNewsActions(){
    document.querySelectorAll('[data-action="editNews"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let item = getData('news').find(n=>n.id===id);
            openModal('news',item);
        });
    });
    document.querySelectorAll('[data-action="delNews"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            if(confirm('Xóa tin tức?')){
                let id = parseInt(btn.dataset.id);
                let newList = getData('news').filter(n=>n.id!==id);
                saveData('news',newList);
                renderSection('news');
            }
        });
    });
}

// USERS
async function renderUserTable(container) {
    let users = getData('users');
    container.innerHTML = `<button class="btn-add" id="addUserBtn"><i class="fas fa-plus"></i> Thêm người dùng</button>
    <table class="data-table"><thead><tr><th>ID</th><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Thao tác</th></tr></thead><tbody>
    ${users.map(u=>`<tr><td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>
    <td><button class="btn-icon btn-edit" data-id="${u.id}" data-action="editUser"><i class="fas fa-edit"></i></button>
    <button class="btn-icon btn-delete" data-id="${u.id}" data-action="delUser"><i class="fas fa-trash"></i></button></td></tr>`).join('')}
    </tbody></table>`;
    document.getElementById('addUserBtn')?.addEventListener('click',()=>openModal('user',null));
    document.querySelectorAll('[data-action="editUser"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            let id = parseInt(btn.dataset.id);
            let user = getData('users').find(u=>u.id===id);
            openModal('user',user);
        });
    });
    document.querySelectorAll('[data-action="delUser"]').forEach(btn=>{
        btn.addEventListener('click',()=>{
            if(confirm('Xóa người dùng?')){
                let id = parseInt(btn.dataset.id);
                let newUsers = getData('users').filter(u=>u.id!==id);
                saveData('users',newUsers);
                renderUserTable(container);
            }
        });
    });
}

// ORDERS
async function renderOrderTable(container) {
    let orders = getData('orders');
    let users = getData('users');
    container.innerHTML = `<button class="btn-add" id="addOrderBtn"><i class="fas fa-plus"></i> Tạo đơn hàng mới</button>
    <table class="data-table"><thead><tr><th>ID</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr></thead><tbody>
    ${orders.map(o=>{
        let userName = users.find(u=>u.id===o.userId)?.name || 'Khách';
        return `<tr><td>#${o.id}</td><td>${userName}</td><td>${o.total.toLocaleString()}₫</td><td><span class="badge-status ${o.status==='delivered'?'bg-success':'bg-warning'}">${o.status}</span></td>
        <td>${o.orderDate}</td><td><button class="btn-icon btn-edit" data-id="${o.id}" data-action="editOrder"><i class="fas fa-edit"></i></button>
        <button class="btn-icon btn-delete" data-id="${o.id}" data-action="delOrder"><i class="fas fa-trash"></i></button></td></tr>`;
    }).join('')}
    </tbody></table>`;
    document.getElementById('addOrderBtn')?.addEventListener('click',()=>openModal('order',null));
    attachOrderActions();
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
            if(confirm('Xóa đơn hàng?')){
                let id = parseInt(btn.dataset.id);
                let newOrders = getData('orders').filter(o=>o.id!==id);
                saveData('orders',newOrders);
                renderSection('orders');
            }
        });
    });
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
    container.innerHTML = `<div style="background:white; border-radius:1.5rem; padding:1.5rem;"><h3>📊 Biểu đồ doanh thu theo tháng</h3><canvas id="revenueChartCanvas" height="250"></canvas>
    <div style="margin-top:1rem;"><h4>Tổng doanh thu đã giao: ${orders.reduce((s,o)=>s+o.total,0).toLocaleString()}₫</h4></div></div>`;
    setTimeout(()=>{
        let ctx = document.getElementById('revenueChartCanvas')?.getContext('2d');
        if(revenueChart) revenueChart.destroy();
        if(ctx) revenueChart = new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'Doanh thu (VND)', data, backgroundColor:'#0f3b2c' }] } });
    },100);
}

// MODAL LOGIC
function openModal(type, entity) {
    currentEntityType = type;
    currentEditId = entity?.id || null;
    const modal = document.getElementById('genericModal');
    const titleMap = { category:'Loại sản phẩm', product:'Sản phẩm', news:'Tin tức', user:'Người dùng', order:'Đơn hàng' };
    document.getElementById('modalTitle').innerText = entity ? `Chỉnh sửa ${titleMap[type]}` : `Thêm ${titleMap[type]}`;
    let fieldsHtml = '';
    if(type === 'category') fieldsHtml = `<label>Tên loại</label><input id="catName" value="${entity?.name||''}" required>`;
    if(type === 'product') {
        let cats = getData('categories');
        fieldsHtml = `<label>Tên sản phẩm</label><input id="prodName" value="${entity?.name||''}">
        <label>Giá (VND)</label><input id="prodPrice" value="${entity?.price||''}">
        <label>Danh mục</label><select id="prodCat">${cats.map(c=>`<option value="${c.id}" ${entity?.categoryId==c.id?'selected':''}>${c.name}</option>`).join('')}</select>
        <label>Tồn kho</label><input id="prodStock" value="${entity?.stock||0}">`;
    }
    if(type === 'news') fieldsHtml = `<label>Tiêu đề</label><input id="newsTitle" value="${entity?.title||''}"><label>Nội dung</label><textarea id="newsContent">${entity?.content||''}</textarea><label>Ngày</label><input id="newsDate" value="${entity?.date||'2025-03-01'}">`;
    if(type === 'user') fieldsHtml = `<label>Họ tên</label><input id="userName" value="${entity?.name||''}"><label>Email</label><input id="userEmail" value="${entity?.email||''}"><label>Vai trò</label><select id="userRole"><option value="customer">Khách hàng</option><option value="admin">Admin</option></select>`;
    if(type === 'order') {
        let users = getData('users');
        fieldsHtml = `<label>Người dùng</label><select id="orderUserId">${users.map(u=>`<option value="${u.id}" ${entity?.userId==u.id?'selected':''}>${u.name}</option>`).join('')}</select>
        <label>Tổng tiền</label><input id="orderTotal" value="${entity?.total||''}"><label>Trạng thái</label><select id="orderStatus"><option value="pending" ${entity?.status==='pending'?'selected':''}>Chờ xử lý</option><option value="processing" ${entity?.status==='processing'?'selected':''}>Đang xử lý</option><option value="delivered" ${entity?.status==='delivered'?'selected':''}>Đã giao</option><option value="cancelled" ${entity?.status==='cancelled'?'selected':''}>Đã hủy</option></select>
        <label>Ngày đặt</label><input id="orderDate" value="${entity?.orderDate||'2025-03-15'}">`;
    }
    document.getElementById('modalFields').innerHTML = fieldsHtml;
    modal.style.display = 'flex';
}
function closeModal() { document.getElementById('genericModal').style.display = 'none'; }
document.getElementById('modalCloseBtn').addEventListener('click',closeModal);
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
            cats.push({id:newId, name});
        }
        saveData('categories',cats);
    }
    if(type === 'product'){
        let name = document.getElementById('prodName').value;
        let price = parseInt(document.getElementById('prodPrice').value);
        let categoryId = parseInt(document.getElementById('prodCat').value);
        let stock = parseInt(document.getElementById('prodStock').value);
        let prods = getData('products');
        if(currentEditId){
            let p = prods.find(p=>p.id===currentEditId);
            if(p){ p.name=name; p.price=price; p.categoryId=categoryId; p.stock=stock; }
        } else {
            let newId = Date.now();
            prods.push({id:newId, name, price, categoryId, stock, image:"🏸"});
        }
        saveData('products',prods);
    }
    if(type === 'news'){
        let title = document.getElementById('newsTitle').value;
        let content = document.getElementById('newsContent').value;
        let date = document.getElementById('newsDate').value;
        let newsList = getData('news');
        if(currentEditId){
            let n = newsList.find(n=>n.id===currentEditId);
            if(n){ n.title=title; n.content=content; n.date=date; }
        } else {
            newsList.push({id:Date.now(), title, content, date});
        }
        saveData('news',newsList);
    }
    if(type === 'user'){
        let name = document.getElementById('userName').value;
        let email = document.getElementById('userEmail').value;
        let role = document.getElementById('userRole').value;
        let users = getData('users');
        if(currentEditId){
            let u = users.find(u=>u.id===currentEditId);
            if(u){ u.name=name; u.email=email; u.role=role; }
        } else {
            users.push({id:Date.now(), name, email, phone:'', role, created_at:new Date().toISOString().slice(0,10)});
        }
        saveData('users',users);
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
    }
    closeModal();
    renderSection(currentSection);
});

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
    } else {
        document.getElementById('loginError').innerText = 'Sai tài khoản hoặc mật khẩu';
    }
});
document.getElementById('logoutAdminBtn').addEventListener('click',()=>{
    sessionStorage.removeItem('adminLogged');
    loginView.style.display = 'flex';
    adminApp.style.display = 'none';
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