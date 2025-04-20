import { useState, useEffect } from "react";

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  // 1. Lấy câu hỏi khi mount
  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        const initA = {};
        const initL = {};
        data.forEach(({ id }) => {
          initA[id] = "";
          initL[id] = false;
        });
        setAnswers(initA);
        setLoadingMap(initL);
      });
  }, []);

  const handleChange = (id, text) => {
    setAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const gradeQuestion = async (questionId) => {
    if (!answers[questionId]?.trim()) return;

    setLoadingMap((prev) => ({ ...prev, [questionId]: true }));
    setResults((prev) => ({ ...prev, [questionId]: null }));

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissions: [
            { questionId, answer: answers[questionId] }
          ]
        }),
      });
      const data = await res.json();
      setResults((prev) => ({
        ...prev,
        [questionId]: data.results?.[0] || { error: "No result" }
      }));
    } catch {
      setResults((prev) => ({
        ...prev,
        [questionId]: { error: "Chấm thất bại" }
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start p-6 bg-gradient-to-br from-purple-100 to-blue-50">
      {/* Tăng chiều ngang bằng w-full + max-w-5xl */}
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-4xl font-bold text-center text-purple-800">
          Bài Tự Luận
        </h1>

        {questions.map(({ id, prompt }, i) => (
          <div key={id} className="card">
            <label className="block font-medium text-gray-700 mb-2">
              Câu {i + 1}: {prompt}
            </label>

            <textarea
              rows={1}
              className="auto-resize w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              value={answers[id]}
              onChange={(e) => handleChange(id, e.target.value)}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Nhập câu trả lời…"
              disabled={loadingMap[id]}
            />

            <button
              onClick={() => gradeQuestion(id)}
              disabled={loadingMap[id]}
              className={`mt-3 inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-full transition
                ${loadingMap[id]
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
                }`}
            >
              {loadingMap[id] ? (
                <>
                  <div className="relative">
                    <div className="spinner"></div>
                    <div className="spinnerin"></div>
                  </div>
                  Đang chấm…
                </>
              ) : (
                "Chấm câu này"
              )}
            </button>

            {results[id] && (
              <div className="mt-4 bg-gray-50 border-l-4 border-purple-500 p-4 rounded">
                {results[id].error ? (
                  <p className="text-red-600">{results[id].error}</p>
                ) : (
                  <>
                    <p><strong>Điểm:</strong> {results[id].score}%</p>
                    <p className="mt-1"><strong>Nhận xét:</strong> {results[id].feedback}</p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
