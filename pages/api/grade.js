import dotenv from "dotenv";
dotenv.config();


export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const submissions = req.body.submissions;
  if (!Array.isArray(submissions) || submissions.length === 0) {
    return res
      .status(400)
      .json({ error: "Thiếu submissions: [{questionId,answer,answerKey},…]" });
  }

  const results = await Promise.all(
    submissions.map(async ({ questionId, answer, answerKey }) => {
      const userAnswer = (answer || "").trim();
      if (!answerKey) {
        return {
          questionId,
          score: 0,
          feedback: "Không có đáp án mẫu cho câu hỏi này."
        };
      }
      if (!userAnswer) {
        return {
          questionId,
          score: 0,
          feedback: "Bạn chưa nhập câu trả lời."
        };
      }

      // Build the prompt
      const prompt = `
Bạn là giáo viên. So sánh câu trả lời của học sinh với đáp án mẫu và cho điểm tổng thể % (0–100).
Các ký tự phụ hay định dạng (dấu gạch đầu dòng, xuống dòng…) không ảnh hưởng.
Chữ "i" và "y" trong tiếng Việt tương đương, hãy bỏ qua nếu có khác biệt.
Đáp án mẫu: """${answerKey}"""
Bài làm: """${userAnswer}"""
Trả về đúng JSON: { "score": số, "feedback": "…" }
      `;

      // Call OpenRouter / DeepSeek
      let aiContent;
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
          const errText = await apiRes.text();
          throw new Error(errText);
        }
        const { choices } = await apiRes.json();
        aiContent = choices[0].message.content;
      } catch (err) {
        console.error(`Error calling AI for ${questionId}:`, err);
        return {
          questionId,
          score: 0,
          feedback: "Lỗi khi kết nối AI, vui lòng thử lại sau."
        };
      }

      // Parse the JSON blob from AI response
      try {
        const jsonBlob = aiContent.match(/\{[\s\S]*\}/)[0];
        const { score, feedback } = JSON.parse(jsonBlob);
        return { questionId, score, feedback };
      } catch (err) {
        console.error(`Invalid JSON from AI for ${questionId}:`, aiContent);
        return {
          questionId,
          score: 0,
          feedback: "AI trả về dữ liệu không hợp lệ."
        };
      }
    })
  );

  res.status(200).json({ results });
}
