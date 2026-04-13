(function () {
    // 1. Inject CSS for Chatbot
    const styleString = `
        /* Chatbot Container */
        .triplet-chatbot-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
        }

        /* Chat Toggle Button */
        .triplet-chat-toggle {
            background-color: #128800; /* Biểu tượng đỏ đặc trưng của thể thao giống nút */
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.3s ease;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .triplet-chat-toggle:hover {
            transform: scale(1.1);
        }

        /* Chat Window */
        .triplet-chat-window {
            width: 350px;
            height: 500px;
            background: #ffffff;
            border-radius: 15px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            transform-origin: bottom right;
            animation: chatSlideUp 0.3s ease-out;
        }

        @keyframes chatSlideUp {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
        }

        /* Chat Header */
        .triplet-chat-header {
            background-color: #128800;
            color: #fff;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .triplet-chat-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }
        .triplet-chat-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        }

        /* Chat Body */
        .triplet-chat-body {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background-color: #f9f9f9;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        /* Chat Messages */
        .triplet-msg {
            max-width: 80%;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
        }
        .triplet-msg.user {
            align-self: flex-end;
            background-color: #128800;
            color: white;
            border-bottom-right-radius: 2px;
        }
        .triplet-msg.ai {
            align-self: flex-start;
            background-color: #e5e5ea;
            color: #000;
            border-bottom-left-radius: 2px;
        }

        /* Typing indicator */
        .triplet-typing {
            font-size: 12px;
            color: #888;
            align-self: flex-start;
            display: none;
            margin-left: 10px;
            margin-bottom: 10px;
        }

        /* Chat Footer */
        .triplet-chat-footer {
            padding: 10px;
            background: #fff;
            border-top: 1px solid #ddd;
            display: flex;
            gap: 10px;
        }
        .triplet-chat-input {
            flex: 1;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
        }
        .triplet-chat-input:focus {
            border-color: #128800;
        }
        .triplet-chat-send {
            background-color: #128800;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background 0.2s;
        }
        .triplet-chat-send:hover {
            background-color: #c0000d;
        }
    `;

    const style = document.createElement('style');
    style.innerHTML = styleString;
    document.head.appendChild(style);

    // 2. Inject HTML for Chatbot
    const chatContainer = document.createElement('div');
    chatContainer.className = 'triplet-chatbot-container';
    chatContainer.innerHTML = `
        <div class="triplet-chat-window" id="triplet-chat-window">
            <div class="triplet-chat-header">
                <div>
                    <h3>TripleT AI Assistant</h3>
                    <small style="font-size:11px; opacity:0.8">Sẵn sàng hỗ trợ bạn</small>
                </div>
                <button class="triplet-chat-close" id="triplet-chat-close"><i class="fa-solid fa-times"></i></button>
            </div>
            <div class="triplet-chat-body" id="triplet-chat-body">
                <div class="triplet-msg ai">Xin chào! 👋 Mình là trợ lý AI của TripleT. Bạn cần tư vấn chọn vợt, giày hay phụ kiện nào ạ?</div>
            </div>
            <div class="triplet-typing" id="triplet-typing">AI đang gõ...</div>
            <div class="triplet-chat-footer">
                <input type="text" class="triplet-chat-input" id="triplet-chat-input" placeholder="Nhập tin nhắn...">
                <button class="triplet-chat-send" id="triplet-chat-send"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
        <button class="triplet-chat-toggle" id="triplet-chat-toggle">
            <i class="fa-solid fa-robot"></i>
        </button>
    `;
    document.body.appendChild(chatContainer);

    // 3. Logic handling
    const chatWindow = document.getElementById('triplet-chat-window');
    const chatToggle = document.getElementById('triplet-chat-toggle');
    const chatClose = document.getElementById('triplet-chat-close');
    const chatBody = document.getElementById('triplet-chat-body');
    const chatInput = document.getElementById('triplet-chat-input');
    const chatSend = document.getElementById('triplet-chat-send');
    const typingIndicator = document.getElementById('triplet-typing');

    // Toggle chat window open/close
    chatToggle.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        if (chatWindow.style.display === 'flex') {
            chatInput.focus();
        }
    });

    chatClose.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `triplet-msg ${sender}`;
        msgDiv.innerText = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // BƯỚC QUAN TRỌNG: DÁN API KEY CỦA BẠN VÀO ĐÂY
    const GEMINI_API_KEY = 'AIzaSyBwp84EQ7Jdspi6B8FqoQR8zx6pERwR49Y';

    // Variable to store conversation history
    let chatHistory = [];
    const systemInstruction = "Bối cảnh: Bạn là trợ lý ảo thân thiện của cửa hàng cầu lông TripleT. Hãy tư vấn nhiệt tình, ngắn gọn, súc tích (dưới 4 câu) về các loại vợt, phụ kiện, kỹ thuật chơi cầu lông. Không dùng định dạng markdown quá phức tạp.\n\nNhớ dựa vào mạch trò chuyện để tư vấn. Khách hỏi: ";

    async function fetchGeminiResponse(userText) {
        if (!GEMINI_API_KEY) {
            return "Lỗi cấu hình: Vui lòng dán API Key của Gemini vào file chat.js để hệ thống hoạt động.";
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        let promptText = userText;
        // Thêm system instruction ở tin nhắn đầu tiên
        if (chatHistory.length === 0) {
            promptText = systemInstruction + userText;
        }

        // Lưu tin nhắn của user vào lịch sử
        chatHistory.push({
            role: "user",
            parts: [{ text: promptText }]
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: chatHistory
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Chi tiết lỗi API:", errText);
                chatHistory.pop(); // Xóa tin nhắn vừa add nếu API lỗi
                if (response.status === 429) {
                    return "AI đang xử lý quá nhiều yêu cầu cùng lúc (Rate Limit API). Bạn vui lòng đợi khoảng 15-20 giây rồi thử chat lại nhé!";
                }
                return "Dạ hệ thống AI đang gặp sự cố kết nối, xin vui lòng thử lại sau ạ.";
            }

            const data = await response.json();
            let aiReply = data.candidates[0].content.parts[0].text;
            // Xóa đi các dấu hoa thị dư thừa thường có của markdown nếu có
            aiReply = aiReply.replace(/\*\*/g, '');

            // Lưu câu trả lời của AI vào lịch sử
            chatHistory.push({
                role: "model",
                parts: [{ text: aiReply }]
            });

            return aiReply;

        } catch (error) {
            console.error("Lỗi:", error);
            chatHistory.pop(); // Xóa tin nhắn vừa add nếu mạng lỗi
            return "Kết nối mạng không ổn định, vui lòng thử lại.";
        }
    }

    async function handleSend() {
        const text = chatInput.value.trim();
        if (!text) return;

        // User message
        addMessage(text, 'user');
        chatInput.value = '';

        // Typing effect
        typingIndicator.style.display = 'block';
        chatBody.scrollTop = chatBody.scrollHeight;

        // Call Gemini API
        const responseText = await fetchGeminiResponse(text);

        typingIndicator.style.display = 'none';
        addMessage(responseText, 'ai');
    }

    chatSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

})();
