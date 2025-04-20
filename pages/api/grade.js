// pages/api/grade.js

import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { answer, questionId } = req.body;
  if (!answer) {
    return res.status(400).json({ error: "Thiếu answer trong request body" });
  }

  // 1. Parse ANSWER_KEYS_JSON từ biến môi trường
  let answerKeys;
  try {
    answerKeys = JSON.parse(process.env.ANSWER_KEYS_JSON || "{}");
  } catch (e) {
    console.error("Invalid ANSWER_KEYS_JSON:", e);
    return res.status(500).json({ error: "Cấu hình đáp án mẫu không hợp lệ" });
  }

  // 2. Lấy đáp án theo questionId (mặc định 'q1')
  const key = questionId || "q1";
  const answerKey = answerKeys[key];
  if (!answerKey) {
    return res
      .status(400)
      .json({ error: `Không tìm thấy answerKey cho questionId='${key}'` });
  }

  // 3. Xây prompt
  const prompt = `
  Bạn là giáo viên. So sánh câu trả lời của học sinh với đáp án mẫu và cho điểm % (0–100),
  rồi viết nhận xét tổng quan 1–2 câu.
  Những thành phần phụ như dấu gạch đầu dòng "-", dấu "+" hay cách dòng đều không quan trọng và không ảnh hưởng đến số điểm.
  Thêm nữa, chữ "i" và "y" trong Tiếng Việt rất giống nhau nên các từ như "pháp lí" và "pháp lý" đều giống nhau, hãy bỏ qua nếu có sự khác biệt này.
  Lưu ý: Khi bạn chấm điểm, bạn cần chấm điểm tổng thể. Giả sử học sinh có thể ghi đúng 1 nửa của đáp án chuẩn thì chỉ có thể cho tối đa 50% điểm.
  Đáp án mẫu: """${answerKey}"""
  Bài làm: """${answer}"""
  Trả về đúng JSON: { "score": số, "feedback": "…" }
    `;

  // 4. Gọi OpenRouter DeepSeek V3 free
  try {
    const apiRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
        }),
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      throw new Error(`OpenRouter API error: ${errText}`);
    }

    const { choices } = await apiRes.json();
    const text = choices[0].message.content;
    const data = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);

    return res.status(200).json(data);
  } catch (err) {
    console.error("Grade handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
