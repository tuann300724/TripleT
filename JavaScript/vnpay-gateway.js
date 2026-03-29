(function () {
  "use strict";

  async function hmacSha512(key, message) {
      const encoder = new TextEncoder();
      const cryptoKey = await crypto.subtle.importKey(
          "raw", encoder.encode(key),
          { name: "HMAC", hash: "SHA-512" },
          false, ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
      return Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
  }

  // Hàm encode chuẩn RFC 3986 nhưng khớp với cách Java xử lý dấu +
  function vnpEncode(str) {
      return encodeURIComponent(str).replace(/%20/g, "+");
  }

  window.tripletVnpayCreatePayment = async function (opts) {
      const cfg = window.TRIPLET_VNPAY;
      const now = new Date();
      
      const formatDate = (d) => {
          const pad = (n) => n.toString().padStart(2, '0');
          return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 
                 pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
      };

      // Các tham số bắt buộc theo đúng code Java bạn gửi
      let vnp_Params = {
          vnp_Version: "2.1.0",
          vnp_Command: "pay",
          vnp_TmnCode: cfg.vnp_TmnCode,
          vnp_Amount: (Math.floor(opts.amount) * 100).toString(),
          vnp_CreateDate: formatDate(now),
          vnp_CurrCode: "VND",
          vnp_IpAddr: "127.0.0.1",
          vnp_Locale: "vn",
          vnp_OrderInfo: opts.orderInfo.toString(),
          vnp_OrderType: "other",
          vnp_ReturnUrl: cfg.vnp_ReturnUrl,
          vnp_TxnRef: opts.orderId.toString()
      };

      if (opts.bankCode) vnp_Params["vnp_BankCode"] = opts.bankCode;

      // Sắp xếp Alphabet
      const sortedKeys = Object.keys(vnp_Params).sort();
      
      // Build hashData và query theo đúng kiểu Java (dùng URLEncoder)
      let signData = "";
      let queryData = "";

      for (let i = 0; i < sortedKeys.length; i++) {
          let key = sortedKeys[i];
          let val = vnp_Params[key];
          if (val !== null && val !== undefined && val.length > 0) {
              // Java dùng URLEncoder cho cả Key và Value
              signData += vnpEncode(key) + "=" + vnpEncode(val);
              queryData += vnpEncode(key) + "=" + vnpEncode(val);
              
              if (i < sortedKeys.length - 1) {
                  signData += "&";
                  queryData += "&";
              }
          }
      }

      // Tạo mã băm SecureHash
      const secureHash = await hmacSha512(cfg.vnp_HashSecret, signData);

      // Gửi toàn bộ sang Proxy
      // Lưu ý: Gửi object sạch sang Proxy để Proxy tự build URL cuối
      const response = await fetch(cfg.proxyEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...vnp_Params, vnp_SecureHash: secureHash })
      });

      return await response.json();
  };
})();