
document.addEventListener('DOMContentLoaded', function () {
    // Tự động nhúng AI Chatbot với cache-buster để luôn lấy file mới nhất
    const chatScript = document.createElement('script');
    chatScript.src = '../JavaScript/chat.js?v=' + new Date().getTime();
    chatScript.defer = true;
    document.body.appendChild(chatScript);

    // Tự động nhúng Wishlist
    const wishlistScript = document.createElement('script');
    wishlistScript.src = '../JavaScript/wishlist.js';
    wishlistScript.defer = true;
    document.body.appendChild(wishlistScript);

    try {
        const user = JSON.parse(localStorage.getItem('tripleT_currentUser'));
        const loginBtn = document.getElementById('login-btn');
        const userName = document.getElementById('user-name');
        const userNameText = document.getElementById('user-name-text');
        const logoutIcon = document.getElementById('logout-icon');
        if (user && user.name) {
            loginBtn.style.display = 'none';
            userName.style.display = 'inline-block';
            userNameText.textContent = user.name;
            userNameText.onclick = function() { location.href = 'tai-khoan.html'; };
            userNameText.style.textDecoration = 'underline';
            logoutIcon.style.display = 'inline-block';
        } else {
            loginBtn.style.display = 'inline-block';
            userName.style.display = 'none';
            logoutIcon.style.display = 'none';
        }
        logoutIcon.onclick = function (e) {
            localStorage.removeItem('tripleT_currentUser');
            location.reload();
            location.href = 'home.html';
        };
    } catch { }
});