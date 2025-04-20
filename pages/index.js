import { useState } from "react";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);

  // Bạn sẽ thay bằng load từ DB sau này
  const answerKey = `
Nguyên lý cung – cầu:
- Khi giá tăng, lượng cung tăng, lượng cầu giảm.
- Giá trần dưới giá cân bằng dẫn tới thiếu hụt.
`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer, answerKey }),
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Bài Tự Luận
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={8}
            className="w-full border rounded p-2 focus:ring"
            placeholder="Viết câu trả lời…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Nộp bài
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : (
              <>
                <p>
                  <strong>Điểm:</strong> {result.score}%
                </p>
                <p>
                  <strong>Nhận xét:</strong> {result.feedback}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}