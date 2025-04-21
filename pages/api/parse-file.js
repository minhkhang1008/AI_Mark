// pages/api/parse-file.js
import dotenv from "dotenv";
dotenv.config();

// Nếu Node <18, import fetch từ node‑fetch

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Thiếu text để phân tích" });

  // Xây prompt cho AI
  const prompt = `
Bạn là một trợ lý AI. Tôi sẽ cung cấp 1 đoạn văn bản hoặc file tài liệu (txt hoặc docx) chứa các câu hỏi (có thể có hoặc không câu trả lời) (có thể liền nhau hoặc không, không có định dạng phân biệt).
Việc của bạn như sau:
1) Phân tích và tách ra thành mảng các object { "prompt": "...", "answerKey": "..." }.
2) Đặt một **tên bộ câu hỏi** ngắn gọn, súc tích phù hợp với nội dung các câu hỏi.

Trả về đúng JSON như:
{
  "setName": "Tên bộ câu hỏi phù hợp",
  "questions": [
    { "prompt": "Câu hỏi 1...", "answerKey": "Đáp án mẫu 1..." },
    { "prompt": "Câu hỏi 2...", "answerKey": "Đáp án mẫu 2..." },
    ...
  ]
}

ĐOẠN NGUYÊN BẢN: """${text}"""
  `;

  try {
    const apiRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        })
      }
    );
    if (!apiRes.ok) {
      const errTxt = await apiRes.text();
      throw new Error(errTxt);
    }
    const { choices } = await apiRes.json();
    const textResp = choices[0].message.content;
    // Extract JSON block
    const jsonStr = textResp.match(/\{[\s\S]*\}/)[0];
    const data = JSON.parse(jsonStr);
    return res.status(200).json(data);
  } catch (err) {
    console.error("parse-file error:", err);
    return res.status(500).json({ error: "Lỗi khi gọi AI phân tích" });
  }
}
