// Trong file vnpay-proxy.mjs, phần xử lý POST:
const body = JSON.parse(Buffer.concat(chunks).toString());

// Tách SecureHash ra để nối vào cuối cùng
const secureHash = body.vnp_SecureHash;
delete body.vnp_SecureHash;

// Build query string theo đúng thứ tự đã nhận
const searchParams = new URLSearchParams();
for (const key in body) {
    searchParams.append(key, body[key].toString());
}

// Thay đổi dấu %20 thành dấu + để khớp URLEncoder của Java
let queryString = searchParams.toString().replace(/\+/g, "%20"); 
// (Tùy phiên bản VNPay, nhưng an toàn nhất là để giống hệt signData)
// Ở đây ta dùng chuẩn Java:
queryString = Object.keys(body)
    .sort()
    .map(k => encodeURIComponent(k).replace(/%20/g, "+") + "=" + encodeURIComponent(body[k]).replace(/%20/g, "+"))
    .join("&");

const finalUrl = `${VNPAY_URL}?${queryString}&vnp_SecureHash=${secureHash}`;

res.writeHead(200, { "Content-Type": "application/json" });
res.end(JSON.stringify({ status: "success", paymentUrl: finalUrl }));