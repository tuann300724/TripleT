$header = @"
    <header class="site-header">
        <div class="header-inner">
            <a href="Home.html" class="logo">
                <span class="logo-mark">🏸</span>
                <span>TripleT Cầu Lông</span>
            </a>

            <nav class="nav-main" id="nav-menu">
                <a href="Home.html">Trang chủ</a>
                <a href="tin-tuc.html">Tin tức</a>
                <a href="san-pham.html">Sản phẩm</a>
                <a href="giao-luu.html">Giao lưu</a>
                <a href="dat-san.html">Đặt sân</a>
            </nav>

            <div class="header-actions">
                <button type="button" class="cart-toggle" id="cart-toggle">
                    <span class="cart-toggle-icon">🛒</span>
                    <span class="cart-badge" id="cart-badge" hidden>0</span>
                </button>

                <a href="login.html" class="btn btn-primary" id="login-btn">Đăng nhập</a>
                <span id="user-name" class="btn btn-primary"
                    style="display:none;cursor:pointer;position:relative;user-select:none;">
                    <span id="user-name-text"></span>
                    <span id="logout-icon"
                        style="display:inline-block;margin-left:10px;color:#ffffff;font-size:20px;cursor:pointer;transition:color 0.2s;vertical-align:middle;">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </span>
                </span>
                <button type="button" class="menu-toggle" id="menu-toggle">
                    <span class="hamburger-bar"></span>
                    <span class="hamburger-bar"></span>
                    <span class="hamburger-bar"></span>
                </button>
            </div>
        </div>
    </header>
"@
$cart_and_scripts = @"
    <div class="cart-backdrop" id="cart-backdrop" hidden aria-hidden="true"></div>

    <aside class="cart-drawer" id="cart-drawer" hidden aria-hidden="true" aria-labelledby="cart-title" role="dialog">
      <div class="cart-drawer-inner">
        <div class="cart-drawer-head">
          <h2 id="cart-title">Giỏ hàng</h2>
          <button type="button" class="cart-close" id="cart-close" aria-label="Đóng giỏ hàng">
            ×
          </button>
        </div>
        <div class="cart-drawer-body">
          <p class="cart-empty" id="cart-empty">
            Chưa có sản phẩm. Hãy thêm từ danh sách nhé!
          </p>
          <ul class="cart-lines" id="cart-lines"></ul>
        </div>
        <div class="cart-drawer-foot">
          <div class="cart-summary-row">
            <span>Số lượng</span>
            <span id="cart-count-summary">0</span>
          </div>
          <div class="cart-summary-row cart-summary-total">
            <span>Tạm tính</span>
            <strong id="cart-subtotal">0₫</strong>
          </div>
          <button type="button" class="btn btn-primary cart-checkout" id="cart-checkout" disabled>
            Xem đơn &amp; thanh toán
          </button>
          <button type="button" class="cart-clear" id="cart-clear">
            Xóa toàn bộ giỏ
          </button>
        </div>
      </div>
    </aside>

    <div class="cart-toast" id="cart-toast" role="status" aria-live="polite" hidden></div>

    <script src="../JavaScript/session.js" defer></script>
    <script src="../JavaScript/cart.js" defer></script>
"@

$files = @("giao-luu.html", "dat-san.html", "so-sanh.html", "tra-cuu.html", "tai-khoan.html")

foreach ($file in $files) {
    if (Test-Path "Page\$file") {
        $content = Get-Content "Page\$file" -Raw
        
        # Replace header
        $content = $content -replace '(?s)<header class="site-header">.*?</header>', $header
        
        # Inject cart & scripts before </body> if not present
        if ($content -notmatch 'id="cart-drawer"') {
            $content = $content -replace '</body>', "$cart_and_scripts`n</body>"
        }
        
        Set-Content -Path "Page\$file" -Value $content -Encoding UTF8
        Write-Host "Updated $file"
    }
}
