import { useState, useEffect, useCallback } from "react";
import mammoth from "mammoth";               
import { PRESETS } from "../data/presets";

export default function Home() {
  const STORAGE_KEY = "ai_mark_custom_sets";

  // All sets (presets + custom)
  const [sets, setSets] = useState([]);
  const [currentSetId, setCurrentSetId] = useState(null);

  // Quiz state
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  // Edit modal state (select / import / edit)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState("select");
  const [editingSetId, setEditingSetId] = useState(null);
  const [editSetName, setEditSetName] = useState("");
  const [editQuestions, setEditQuestions] = useState([]);

  // Import mode state
  const [fileContent, setFileContent] = useState("");
  const [parsing, setParsing] = useState(false);

  // Undo history for editQuestions
  const [history, setHistory] = useState([]);

  // Array of button color classes
  const buttonColors = [
    "bg-blue-500 hover:bg-blue-600 border-blue-400 text-white",
    "bg-green-500 hover:bg-green-600 border-green-400 text-white",
    "bg-purple-500 hover:bg-purple-600 border-purple-400 text-white",
    "bg-pink-500 hover:bg-pink-600 border-pink-400 text-white",
    "bg-yellow-500 hover:bg-yellow-600 border-yellow-400 text-white",
    "bg-indigo-500 hover:bg-indigo-600 border-indigo-400 text-white",
    "bg-red-500 hover:bg-red-600 border-red-400 text-white",
    "bg-teal-500 hover:bg-teal-600 border-teal-400 text-white",
  ];

  // Load sets on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const presetSets = Object.keys(PRESETS).map((key) => ({
      id: key,
      name: key,
      questions: PRESETS[key].map((q, i) => ({
        ...q,
        id: `${key}-q${i + 1}`,
      })),
    }));
    const all = [...presetSets, ...stored];
    setSets(all);
    if (all.length) setCurrentSetId(all[0].id);
  }, []);

  // Re-init quiz when currentSetId changes
  useEffect(() => {
    const setObj = sets.find((s) => s.id === currentSetId);
    if (!setObj) return;
    const a = {}, r = {}, l = {};
    setObj.questions.forEach((q) => {
      a[q.id] = "";
      r[q.id] = null;
      l[q.id] = false;
    });
    setAnswers(a);
    setResults(r);
    setLoadingMap(l);
  }, [currentSetId, sets]);

  // Quiz grading
  const handleAnswerChange = (id, text) =>
    setAnswers((prev) => ({ ...prev, [id]: text }));
  const gradeQuestion = async (q) => {
    const { id, answerKey } = q;
    const userAnswer = answers[id]?.trim();
    if (!userAnswer) return;
    setLoadingMap((l) => ({ ...l, [id]: true }));
    setResults((r) => ({ ...r, [id]: null }));
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissions: [
            { questionId: id, answer: userAnswer, answerKey },
          ],
        }),
      });
      const { results: arr } = await res.json();
      setResults((r) => ({ ...r, [id]: arr[0] }));
    } catch {
      setResults((r) => ({
        ...r,
        [id]: { score: 0, feedback: "Chấm bài thất bại." },
      }));
    } finally {
      setLoadingMap((l) => ({ ...l, [id]: false }));
    }
  };

  // Modal controls
  const openEditModal = () => {
    setEditMode("select");
    setShowEditModal(true);
  };
  const closeEditModal = () => setShowEditModal(false);

  // Select a set to edit
  const selectSetToEdit = (setId) => {
    const s = sets.find((s) => s.id === setId);
    if (!s) {
      console.warn(`Set ${setId} không tồn tại`);
      return;
    }
    setEditingSetId(setId);
    setEditSetName(s.name);
    setEditQuestions(s.questions.map((q) => ({ ...q })));
    setHistory([]);
    setEditMode("edit");
  };

  // Handle file import (.txt, .doc, .docx)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt') {
      const text = await file.text();
      setFileContent(text);
    } else if (ext === 'doc' || ext === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const { value: text } = await mammoth.extractRawText({ arrayBuffer });
      setFileContent(text);
    } else {
      alert('Unsupported format. Supported: .txt, .doc, .docx');
    }
  };

  // Import parsed file content to questions (via AI parse endpoint)
  const importFromFile = async () => {
    if (!fileContent.trim()) return;
    setParsing(true);
    try {
      const res = await fetch("/api/parse-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fileContent }),
      });
      const { setName, questions } = await res.json();

      // Tạo set mới
      const newId = `imported-${Date.now()}`;
      const importedSet = {
        id: newId,
        name: setName,
        questions: questions.map((q, i) => ({
          ...q,
          id: `${newId}-q${i + 1}`
        }))
      };
      // Thêm vào danh sách và chọn luôn
      setSets((prev) => [...prev, importedSet]);
      setCurrentSetId(newId);
      setEditingSetId(newId);
      setEditSetName(setName);
      setEditQuestions(importedSet.questions);
      setHistory([]);
      setEditMode("edit");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi phân tích file");
    } finally {
      setParsing(false);
    }
  };

  // Add a new empty set **and immediately open it in edit mode**
  const addNewSet = () => {
    const newId = `custom-${Date.now()}`;
    const newSet = { id: newId, name: "New Set", questions: [] };

    // 1) Thêm bộ mới vào danh sách
    setSets((prev) => [...prev, newSet]);
    // 2) Chuyển sang bộ mới này
    setCurrentSetId(newId);
    // 3) Mở modal và bật edit mode
    setShowEditModal(true);
    setEditMode("edit");
    // 4) Thiết lập state để edit
    setEditingSetId(newId);
    setEditSetName(newSet.name);
    setEditQuestions([]);
    setHistory([]);
  };

  // Delete set with double-confirm
  const deleteSetDoubleConfirm = (setId) => {
    if (!confirm("Bạn có chắc muốn xóa bộ này?")) return;
    if (!confirm("Hành động này không thể hoàn tác. Vẫn xóa?")) return;
    const filtered = sets.filter((s) => s.id !== setId);
    setSets(filtered);
    const custom = filtered.filter(
      (s) => !Object.keys(PRESETS).includes(s.id)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    if (currentSetId === setId && filtered.length) {
      setCurrentSetId(filtered[0].id);
    }
  };

  // Reset presets
  const resetPresets = () => {
    if (!confirm("Reset tất cả preset về mặc định?")) return;
    const presetSets = Object.keys(PRESETS).map((key) => ({
      id: key,
      name: key,
      questions: PRESETS[key].map((q, i) => ({
        ...q,
        id: `${key}-q${i + 1}`,
      })),
    }));
    const custom = sets.filter(
      (s) => !Object.keys(PRESETS).includes(s.id)
    );
    setSets([...presetSets, ...custom]);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(custom)
    );
  };

  // Save edits
  const saveSetEdits = () => {
    const updated = sets.filter((s) => s.id !== editingSetId);
    updated.push({ id: editingSetId, name: editSetName, questions: editQuestions });
    setSets(updated);
    const custom = updated.filter(
      (s) => !Object.keys(PRESETS).includes(s.id)
    );
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(custom)
    );
    setShowEditModal(false);
  };

  // Undo
  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      setEditQuestions(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "z" && editMode === "edit") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, editMode]);

  // Edit question helpers
  const pushHistory = () =>
    setHistory((h) => [...h, JSON.parse(JSON.stringify(editQuestions))]);
  const updateEditQuestion = (qid, field, val) => {
    pushHistory();
    setEditQuestions((qs) =>
      qs.map((q) => (q.id === qid ? { ...q, [field]: val } : q))
    );
  };
  const addEditQuestion = () => {
    pushHistory();
    const idx = editQuestions.length + 1;
    setEditQuestions((qs) => [...qs, { id: `${editingSetId}-q${idx}`, prompt: "", answerKey: "" }]);
  };
  const removeEditQuestion = (qid) => {
    pushHistory();
    setEditQuestions((qs) => qs.filter((q) => q.id !== qid));
  };

  const currentSet = sets.find((s) => s.id === currentSetId) || { questions: [] };

  return (
    <div className="min-h-screen flex justify-center p-6 bg-gradient-to-br from-purple-100 to-blue-50">
      <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-4xl font-bold text-center text-purple-800">🔖 AI Mark – Chấm Tự Luận</h1>
        {/* Set selector + edit */}
        <div className="flex items-center gap-4">
          <select className="border rounded px-3 py-2 text-sm" value={currentSetId || ""} onChange={(e) => setCurrentSetId(e.target.value)}>
            {sets.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="bg-blue-400 text-white px-3 py-1 text-sm rounded hover:bg-blue-500 transition" onClick={openEditModal}>Chỉnh sửa</button>
        </div>
        {/* Quiz questions */}
        {currentSet.questions.map((q, i) => (
          <div key={q.id} className="card space-y-4">
            <label className="block font-medium text-gray-700">Câu {i + 1}: {q.prompt}</label>
            <textarea
              rows={1} placeholder="Nhập câu trả lời..."
              className="auto-resize w-full border rounded-lg p-3 focus:ring-2 focus:ring-purple-400 transition"
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = `${e.target.scrollHeight}px`; }}
              disabled={loadingMap[q.id]}
            />
            <button onClick={() => gradeQuestion(q)} disabled={loadingMap[q.id]} className={`inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-full transition ${loadingMap[q.id]?'bg-gray-400 cursor-not-allowed':'bg-purple-600 hover:bg-purple-700'}`}>
              {loadingMap[q.id] ? <><div className="relative"><div className="spinner"/><div className="spinnerin"/></div>Đang chấm…</> : "Chấm"}
            </button>
            {results[q.id] && <div className="mt-4 bg-gray-50 border-l-4 border-purple-500 p-4 rounded"><p><strong>Điểm:</strong> {results[q.id].score}%</p><p className="mt-1"><strong>Nhận xét:</strong> {results[q.id].feedback}</p></div>}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-8 z-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded-lg space-y-4">
            {editMode === "select" ? (
              <>
                <h2 className="text-2xl font-bold">Chọn bộ câu hỏi</h2>
                <div className="space-y-2">
                  {sets.map((s, index) => (
                    <div key={s.id} className="flex items-center gap-2 w-full">
                      <button 
                        className={`${buttonColors[index % buttonColors.length]} border-2 px-6 py-3 rounded-lg text-lg font-medium shadow-sm transition-all duration-200 w-full text-left`} 
                        onClick={() => selectSetToEdit(s.id)}
                      >
                        {s.name}
                      </button>
                      <button 
                        className="text-red-500 text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-lg border-2 border-red-200 hover:scale-110 transition-transform duration-200 flex-shrink-0" 
                        onClick={() => deleteSetDoubleConfirm(s.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-4">  
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition" onClick={addNewSet}>+ Thêm bộ mới</button>
                  <button className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition" onClick={resetPresets}>Reset Presets</button>
                  <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition ml-auto" onClick={closeEditModal}>Đóng</button>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept=".txt,.doc,.docx"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      onClick={importFromFile}
                      disabled={parsing}
                      className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {parsing ? "Đang xử lý..." : "Nhập từ file"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Edit mode UI */
              <>
                <h2 className="text-2xl font-bold">Chỉnh sửa: {editSetName}</h2>
                <label className="block font-medium">Tên bộ câu hỏi</label>
                <input className="w-full border rounded p-2" value={editSetName} onChange={(e) => setEditSetName(e.target.value)} />
                <div className="space-y-4 max-h-80 overflow-auto">
                  {editQuestions.map((q, idx) => (
                    <div key={q.id} className="space-y-2 border-b pb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Câu {idx + 1}</span>
                        <button className="text-red-500" onClick={() => removeEditQuestion(q.id)}>Xóa</button>
                      </div>
                      <input className="w-full border rounded p-2" placeholder="Nội dung câu hỏi" value={q.prompt} onChange={(e) => updateEditQuestion(q.id, "prompt", e.target.value)} />
                      <textarea className="w-full border rounded p-2" rows={3} placeholder="Đáp án mẫu" value={q.answerKey} onChange={(e) => updateEditQuestion(q.id, "answerKey", e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={addEditQuestion}>+ Thêm câu hỏi</button>
                  <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" onClick={undo}>Hoàn tác (Undo)</button>
                </div>
                <div className="flex justify-end gap-2">
                  <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={closeEditModal}>Hủy</button>
                  <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={saveSetEdits}>Lưu thay đổi</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
