$script = @"
    <script>
        let posts = JSON.parse(localStorage.getItem('triplet_giao_luu')) || [
            { id: 1, name: 'Hoàng Tùng', avatar: 'T', color: '#ffb800', time: '2 giờ trước', title: 'Cần 2 bạn nam/nữ đánh giao lưu tối nay', desc: 'Team mình hiện có 3 người, cần thêm 2 bạn nữa cho đủ 1 sân. Đánh vui vẻ, không quá căng thẳng.', loc: 'Sân TripleT Q7', matchTime: '19h00 - 21h00 (Hôm nay)', skill: 'Trung bình', contact: '0912345***' },
            { id: 2, name: 'Minh Lan', avatar: 'L', color: '#2D8A68', time: '5 giờ trước', title: 'Thử thách trình độ khá - Thủ Đức', desc: 'Cần tìm đối đánh đơn hoặc đôi nam nữ. Trình độ khá trở lên, bao sân cầu.', loc: 'Sân Bình Thái, Q9', matchTime: '08h00 - 10h00 (Sáng mai)', skill: 'Khá / Giỏi', contact: '0988776***' }
        ];

        function renderPosts() {
            const list = document.getElementById('posts-list');
            const filter = document.getElementById('filter-skill').value;
            let html = '';
            
            let filtered = posts;
            if(filter !== 'all') {
                filtered = posts.filter(p => p.skill === filter);
            }

            if(filtered.length === 0) {
                list.innerHTML = '<p style="text-align:center; color:#999;">Chưa có bài đăng nào.</p>';
                return;
            }

            filtered.forEach(p => {
                html += `
                <div class="post-card">
                    <div class="user-info">
                        <div class="user-avatar" style="background: `+p.color+`; color: #fff;">`+p.avatar+`</div>
                        <div>
                            <strong style="display:block;">`+escapeHtml(p.name)+`</strong>
                            <span style="font-size: 12px; color: #999;">`+escapeHtml(p.time)+`</span>
                        </div>
                    </div>
                    <p style="margin: 0; font-weight: 600; font-size: 17px;">`+escapeHtml(p.title)+`</p>
                    <p style="margin: 10px 0; color: #444; line-height: 1.6;">`+escapeHtml(p.desc)+`</p>
                    
                    <div class="match-details">
                        <span><i class="fa-solid fa-clock"></i> `+escapeHtml(p.matchTime)+`</span>
                        <span><i class="fa-solid fa-location-dot"></i> `+escapeHtml(p.loc)+`</span>
                        <span><i class="fa-solid fa-signal"></i> Trình độ: `+escapeHtml(p.skill)+`</span>
                    </div>
                    
                    <button class="btn btn-ghost" style="width: 100%;" onclick="alert('Vui lòng liên hệ: `+escapeHtml(p.contact)+`')">Liên hệ / Tham gia</button>
                </div>
                `;
            });
            list.innerHTML = html;
        }

        function escapeHtml(s) {
            const d = document.createElement("div");
            d.textContent = s;
            return d.innerHTML;
        }

        function openPostForm() {
            const user = localStorage.getItem('tripleT_currentUser');
            if(!user) {
                alert("Vui lòng đăng nhập để có thể đăng bài gắn nhãn tài khoản của bạn.");
                window.location.href = "login.html";
                return;
            }
            document.getElementById('post-form-overlay').style.display = 'block';
        }

        function closePostForm() {
            document.getElementById('post-form-overlay').style.display = 'none';
        }

        function addPost() {
            const title = document.getElementById('post-title').value.trim();
            const desc = document.getElementById('post-desc').value.trim();
            const loc = document.getElementById('post-loc').value.trim();
            const time = document.getElementById('post-time').value.trim();
            const skill = document.getElementById('post-skill').value;
            
            if(!title || !loc || !time) {
                alert("Vui lòng điền đầy đủ Tiêu đề, Địa điểm, Thời gian.");
                return;
            }

            const user = localStorage.getItem('tripleT_currentUser') || "Khách";
            const newPost = {
                id: Date.now(),
                name: user,
                avatar: user.charAt(0).toUpperCase(),
                color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
                time: 'Vừa xong',
                title: title,
                desc: desc,
                loc: loc,
                matchTime: time,
                skill: skill,
                contact: 'Qua chat hệ thống'
            };

            posts.unshift(newPost);
            localStorage.setItem('triplet_giao_luu', JSON.stringify(posts));
            closePostForm();
            renderPosts();
            
            alert("Tin của bạn đã được đăng thành công!");
        }

        document.addEventListener('DOMContentLoaded', renderPosts);
    </script>
"@

$content = Get-Content "Page\giao-luu.html" -Raw

# Replace the static mock header control
$new_control = @"
        <div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <h1 style="color: var(--green-dark); margin: 0;">Kèo Giao Lưu Mới Nhất</h1>
            <div style="display: flex; gap: 10px; align-items: center;">
                <select id="filter-skill" style="padding: 10px; border-radius: 6px; border: 1px solid #ddd;" onchange="renderPosts()">
                    <option value="all">Tất cả trình độ</option>
                    <option value="Mới tập chơi">Mới tập chơi</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khá / Giỏi">Khá / Giỏi</option>
                </select>
                <button class="btn btn-primary" onclick="openPostForm()">Đăng bài ngay</button>
            </div>
        </div>
"@

$content = $content -replace '(?s)<div style="margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">.*?</div>', $new_control

# Strip the mock posts in `<div id="posts-list">`
$content = $content -replace '(?s)<div id="posts-list">.*?</main>', "<div id=`"posts-list`"></div>`n    </main>"

# Replace the script block
$content = $content -replace '(?s)<script>.*?function openPostForm.*?<\/script>', $script

Set-Content -Path "Page\giao-luu.html" -Value $content -Encoding UTF8
Write-Host "Updated giao-luu.html dynamic features"
