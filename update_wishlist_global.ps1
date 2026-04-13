$files = @("giao-luu.html", "dat-san.html", "so-sanh.html", "tra-cuu.html", "tai-khoan.html", "tin-tuc.html", "tin-tuc-chi-tiet.html", "gio-hang-thanh-toan.html", "thong-tin-thanh-toan.html")
foreach ($file in $files) {
    if (Test-Path "Page\$file") {
        $c = Get-Content "Page\$file" -Raw
        if ($c -notmatch 'wishlist\.js') {
            $c = $c -replace '<script src="\.\./JavaScript/cart\.js" defer></script>', "<script src=`"../JavaScript/cart.js`" defer></script>`n    <script src=`"../JavaScript/wishlist.js`" defer></script>"
            Set-Content -Path "Page\$file" -Value $c -Encoding UTF8
            Write-Host "Injected wishlist.js into $file"
        }
    }
}
