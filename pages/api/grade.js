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
      Bạn là một giáo viên giàu kinh nghiệm, chuyên chấm các bài tự luận. Khi so sánh câu trả lời của học sinh với đáp án mẫu, hãy:
      - Bỏ qua tất cả khác biệt về trình bày và định dạng: dấu gạch đầu dòng, dấu chấm, dấu phẩy, dấu chấm phẩy, xuống dòng, khoảng cách, thụt đầu dòng…
      - Bỏ qua chữ hoa/chữ thường.
      - Bỏ qua các ký tự phụ như dấu nháy, dấu ngoặc, gạch nối…
      - Bỏ qua sự khác nhau giữa “i” và “y” trong tiếng Việt.
      
      Tập trung hoàn toàn vào **nội dung** và **ý chính** của câu trả lời.  
      Sau đó:
      1. Cho điểm tổng thể trên thang 0–100%.  
      2. Viết nhận xét khái quát 1–2 câu.  
      3. Thêm **một câu gợi ý** về phần kiến thức mà học sinh cần ôn tập hoặc làm chắc hơn (chỉ khi học sinh không đạt điểm tối đa)
      
      Trả về đúng định dạng JSON duy nhất:
      \`\`\`json
      {
        "score": <số>,       // số từ 0 đến 100
        "feedback": "<nhận xét> và <gợi ý nên cải thiện phần nào>"
      }
      \`\`\`
      
      Đáp án mẫu: """${answerKey}"""  
      Bài làm: """${userAnswer}"""
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
              model: "deepseek/deepseek-chat-v3-0324:free",
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
