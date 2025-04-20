import dotenv from "dotenv";
dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const submissions = req.body.submissions;
  if (!Array.isArray(submissions) || !submissions.length) {
    return res
      .status(400)
      .json({ error: "Thiếu submissions: [{questionId,answer},…]" });
  }

  // 1. Parse answer keys từ ENV
  let answerKeys;
  try {
    answerKeys = JSON.parse(process.env.ANSWER_KEYS_JSON || "{}");
  } catch (e) {
    console.error("Invalid ANSWER_KEYS_JSON:", e);
    return res.status(500).json({ error: "Invalid ANSWER_KEYS_JSON" });
  }

  // 2. Chấm từng submission
  const results = await Promise.all(
    submissions.map(async ({ questionId, answer }) => {
      const userAnswer = (answer || "").trim();
      const answerKey = answerKeys[questionId]?.trim();
      if (!answerKey) {
        return {
          questionId,
          score: 0,
          feedback: "Không tìm thấy đáp án mẫu cho câu hỏi này."
        };
      }
      if (!userAnswer) {
        return {
          questionId,
          score: 0,
          feedback: "Bạn chưa nhập câu trả lời."
        };
      }

      // 3. Tạo prompt
      const prompt = `
Bạn là giáo viên. So sánh câu trả lời của học sinh với đáp án mẫu và cho điểm tổng thể % (0–100).
Các ký tự phụ như dấu gạch đầu dòng, dấu "+" hay cách dòng không ảnh hưởng.
Chữ "i" và "y" trong tiếng Việt tương đương, hãy bỏ qua sự khác biệt đó.
Nếu học sinh trả lời đúng một phần đáp án, cho tương ứng phần trăm (ví dụ đúng 1/2 thì 50%).
Đáp án mẫu: """${answerKey}"""
Bài làm: """${userAnswer}"""
Trả về đúng định dạng JSON: { "score": số, "feedback": "…" }
      `;

      // 4. Gọi API OpenRouter / DeepSeek
      let choiceText;
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
              temperature: 0
            })
          }
        );
        if (!apiRes.ok) {
          const errTxt = await apiRes.text();
          throw new Error(`OpenRouter error: ${errTxt}`);
        }
        const { choices } = await apiRes.json();
        choiceText = choices[0].message.content;
      } catch (err) {
        console.error(`Error calling OpenRouter for ${questionId}:`, err);
        return {
          questionId,
          score: 0,
          feedback: "Lỗi khi kết nối AI, vui lòng thử lại sau."
        };
      }

      // 5. Parse JSON từ response
      let data;
      try {
        const jsonStr = choiceText.match(/\{[\s\S]*\}/)?.[0];
        data = JSON.parse(jsonStr);
      } catch (err) {
        console.error(`Invalid JSON from AI for ${questionId}:`, choiceText, err);
        return {
          questionId,
          score: 0,
          feedback: "AI trả về dữ liệu không hợp lệ."
        };
      }

      return { questionId, ...data };
    })
  );

  // 6. Trả về kết quả
  return res.status(200).json({ results });
}