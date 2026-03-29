window.TRIPLET_VNPAY = {
  vnp_TmnCode: "O6HIJZ4S", // Ví dụ: O6HIJZ4S
  vnp_HashSecret: "ZM47IH1HUK9S930K4FVJYKSJSH10NUPY".trim(), // Ví dụ: ABCXYZ...
  vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: "http://127.0.0.1:5500/Pages/vnpay-callback.html", // Chỉnh lại theo đúng link live server của bạn
  useLocalProxy: true,
  proxyEndpoint: "http://127.0.0.1:8787/api/vnpay-create"
};