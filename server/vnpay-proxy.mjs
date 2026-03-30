import http from "http";

const VNPAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

const server = http.createServer((req, res) => {

  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  if (req.method === "POST") {

    let chunks = [];

    req.on("data", chunk => {
      chunks.push(chunk);
    });

    req.on("end", () => {

      const body = JSON.parse(Buffer.concat(chunks).toString());

      const secureHash = body.vnp_SecureHash;
      delete body.vnp_SecureHash;

      const queryString = Object.keys(body)
        .sort()
        .map(k =>
          encodeURIComponent(k).replace(/%20/g, "+") +
          "=" +
          encodeURIComponent(body[k]).replace(/%20/g, "+")
        )
        .join("&");

      const finalUrl = `${VNPAY_URL}?${queryString}&vnp_SecureHash=${secureHash}`;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "success",
        paymentUrl: finalUrl
      }));

    });

  }

});

server.listen(8787, () => console.log("Server chạy port 8787"));