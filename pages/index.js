import { useState, useEffect } from "react";
import { PRESETS } from "../data/presets";

export default function Home() {
  const STORAGE_KEY = "ai_mark_custom_questions";

  const [presetKey, setPresetKey] = useState("GDCD9");
  const [questions, setQuestions] = useState([]);
  const [customQs, setCustomQs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [newAnswerKey, setNewAnswerKey] = useState("");

  // 1. On mount: load custom from storage and build questions
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setCustomQs(stored);
  }, []);

  // 2. Whenever presetKey or customQs changes, rebuild questions & reset states
  useEffect(() => {
    // assign new IDs for custom to avoid collisions
    const presetQs = PRESETS[presetKey].map((q, i) => ({
      ...q,
      id: `${presetKey}-q${i+1}`
    }));
    const all = [
      ...presetQs,
      ...customQs.map((q, i) => ({ ...q, id: `custom-q${i+1}` }))
    ];
    setQuestions(all);

    // reset answers, results, loading
    const a = {}, r = {}, l = {};
    all.forEach((q) => {
      a[q.id] = "";
      r[q.id] = null;
      l[q.id] = false;
    });
    setAnswers(a);
    setResults(r);
    setLoadingMap(l);
  }, [presetKey, customQs]);

  const handlePresetChange = (e) => {
    setPresetKey(e.target.value);
  };

  // 3. Show modal
  const openModal = () => {
    setNewPrompt("");
    setNewAnswerKey("");
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // 4. Save new custom question
  const saveNewQuestion = () => {
    if (!newPrompt.trim() || !newAnswerKey.trim()) return;
    const updated = [
      ...customQs,
      { prompt: newPrompt.trim(), answerKey: newAnswerKey.trim() }
    ];
    setCustomQs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    closeModal();
  };

  const handleAnswerChange = (id, text) => {
    setAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const gradeQuestion = async (q) => {
    const { id, answerKey } = q;
    const userAnswer = answers[id].trim();
    if (!userAnswer) return; // skip empty

    setLoadingMap((l) => ({ ...l, [id]: true }));
    setResults((r) => ({ ...r, [id]: null }));

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissions: [
            { questionId: id, answer: userAnswer, answerKey }
          ]
        })
      });
      const { results: arr } = await res.json();
      setResults((r) => ({ ...r, [id]: arr[0] }));
    } catch {
      setResults((r) => ({
        ...r,
        [id]: { score: 0, feedback: "Chấm bài thất bại." }
      }));
    } finally {
      setLoadingMap((l) => ({ ...l, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-6 bg-gradient-to-br from-purple-100 to-blue-50">
      {/* Main card */}
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-4xl font-bold text-center text-purple-800">
          🔖 AI Mark – Chấm Tự Luận
        </h1>

        {/* Preset selector & add button */}
        <div className="flex gap-4">
          <select
            className="border rounded px-3 py-2"
            value={presetKey}
            onChange={handlePresetChange}
          >
            {Object.keys(PRESETS).map((key) => (
              <option key={key} value={key}>
                Preset: {key}
              </option>
            ))}
          </select>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={openModal}
          >
            + Thêm câu hỏi
          </button>
        </div>

        {/* Question list */}
        {questions.map((q, i) => (
          <div key={q.id} className="card space-y-4">
            <label className="block font-medium text-gray-700">
              Câu {i + 1}: {q.prompt}
            </label>
            <textarea
              rows={1}
              className="auto-resize w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-400 transition"
              value={answers[q.id]}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Nhập câu trả lời..."
              disabled={loadingMap[q.id]}
            />
            <button
              onClick={() => gradeQuestion(q)}
              disabled={loadingMap[q.id]}
              className={`inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-full transition ${
                loadingMap[q.id]
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loadingMap[q.id] ? (
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
            {results[q.id] && (
              <div className="mt-4 bg-gray-50 border-l-4 border-purple-500 p-4 rounded">
                <p><strong>Điểm:</strong> {results[q.id].score}%</p>
                <p className="mt-1"><strong>Nhận xét:</strong> {results[q.id].feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal backdrop */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Modal box */}
          <div className="bg-white p-6 rounded-lg max-w-md w-full space-y-4">
            <h2 className="text-2xl font-bold">Thêm câu hỏi mới</h2>
            <input
              className="w-full border rounded p-2"
              placeholder="Nhập câu hỏi..."
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
            />
            <textarea
              className="w-full border rounded p-2 h-24"
              placeholder="Nhập đáp án mẫu..."
              value={newAnswerKey}
              onChange={(e) => setNewAnswerKey(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={closeModal}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={saveNewQuestion}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
