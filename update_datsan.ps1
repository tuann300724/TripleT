$script = @"
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            renderBookings();
        });

        function openBooking(name) {
            document.getElementById('modal-court-name').innerText = 'Đặt sân ' + name;
            document.getElementById('booking-modal').style.display = 'block';
            
            // Fill name if logged in
            const user = localStorage.getItem('tripleT_currentUser');
            if(user) document.getElementById('book-name').value = user;
        }

        function closeBooking() {
            document.getElementById('booking-modal').style.display = 'none';
        }

        function selectSlot(el) {
            if(el.classList.contains('disabled')) return;
            document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
            el.classList.add('selected');
        }

        function confirmBooking() {
            const name = document.getElementById('book-name').value.trim();
            const phone = document.getElementById('book-phone').value.trim();
            const slot = document.querySelector('.time-slot.selected');

            if (!name || !phone || !slot) {
                alert("Vui lòng nhập đầy đủ thông tin và chọn khung giờ!");
                return;
            }
            
            const courtName = document.getElementById('modal-court-name').innerText.replace('Đặt sân ', '');
            let bookings = JSON.parse(localStorage.getItem('triplet_bookings')) || [];
            
            bookings.push({
                id: Date.now(),
                court: courtName,
                name: name,
                phone: phone,
                slot: slot.innerText,
                date: new Date().toLocaleDateString('vi-VN')
            });
            
            localStorage.setItem('triplet_bookings', JSON.stringify(bookings));
            alert("Đặt sân thành công! TripleT sẽ liên hệ xác nhận trong 5 phút.");
            closeBooking();
            renderBookings();
        }
        
        function renderBookings() {
            let bookings = JSON.parse(localStorage.getItem('triplet_bookings')) || [];
            let container = document.getElementById('my-bookings-container');
            
            if(!container) {
                container = document.createElement('div');
                container.id = 'my-bookings-container';
                container.style.marginTop = '40px';
                container.style.padding = '20px';
                container.style.background = '#f0fdf4';
                container.style.borderRadius = '12px';
                container.style.border = '1px solid #bbf7d0';
                document.querySelector('.booking-container').appendChild(container);
            }
            
            if(bookings.length === 0) {
                container.style.display = 'none';
                return;
            }
            
            container.style.display = 'block';
            let html = '<h2 style="color: #166534; margin-top: 0; font-size: 20px;">Lịch đặt sân của bạn</h2>';
            html += '<div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">';
            
            bookings.forEach(b => {
                html += `
                    <div style="background:#fff; padding:15px; border-radius:8px; border-left:4px solid #16a34a; box-shadow:0 2px 5px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
                        <div>
                            <strong style="display:block; font-size:16px;">${b.court}</strong>
                            <span style="font-size:13px; color:#555;"><i class="fa-solid fa-clock"></i> Khung giờ: ${b.slot} | Ngày: ${b.date}</span>
                        </div>
                        <span style="background:#dcfce7; color:#166534; padding:5px 10px; border-radius:4px; font-size:12px; font-weight:bold;">Đang chờ duyệt</span>
                    </div>
                `;
            });
            
            html += '</div>';
            container.innerHTML = html;
        }
    </script>
"@

$content = Get-Content "Page\dat-san.html" -Raw

# Replace the script block
$content = $content -replace '(?s)<script>.*?function openBooking.*?<\/script>', $script

Set-Content -Path "Page\dat-san.html" -Value $content -Encoding UTF8
Write-Host "Updated dat-san.html dynamic features"
