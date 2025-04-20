import { useState } from "react";

export default function Home() {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Đáp án mẫu
  const answerKey = `
Nguyên lý cung – cầu:
- Khi giá tăng, lượng cung tăng, lượng cầu giảm.
- Giá trần dưới giá cân bằng dẫn tới thiếu hụt.
  `;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, questionId: "q1" }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Chấm bài thất bại" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <h1 className="text-4xl font-extrabold text-center text-purple-800">
          Bài Tự Luận
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={6}
            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            placeholder="Viết câu trả lời tại đây…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            disabled={isLoading}
          />

          <button
            type="submit"
            className={`w-full py-3 rounded-full flex items-center justify-center font-semibold 
              ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"}
              text-white transition`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="relative">
                <div className="spinner"></div>
                <div className="spinnerin"></div>
              </div>
            ) : (
              "Nộp bài"
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-gray-50 border-l-4 border-purple-500 p-4 rounded-lg">
            {result.error ? (
              <p className="text-red-600 font-medium">{result.error}</p>
            ) : (
              <>
                <p className="text-xl">
                  <strong>Điểm:</strong> {result.score}%
                </p>
                <p className="mt-2 text-gray-700">
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
