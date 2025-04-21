# AI Mark – 🌟 Tự Động Chấm Bài Tự Luận Bằng AI

> **AI Mark** là web app giúp giáo viên và học sinh tự động chấm điểm bài tự luận và nhận xét bằng trí tuệ nhân tạo **DeepSeek V3** – miễn phí, nhanh chóng và bảo mật.

---

## 🔥 Tính năng nổi bật

- **Chấm điểm tự động** theo tỷ lệ phần trăm (0–100%)  
- **Nhận xét khái quát** 1–2 câu cho mỗi bài làm  
- **Loading spinner** sinh động khi chờ AI chấm bài  
- **Giao diện hiện đại**: Next.js + Tailwind CSS + gradient background  
- **Triển khai dễ dàng**: Lưu data hoàn toàn trên local browser và gọi API OpenRouter, có thể chạy local hoặc host ở bất cứ đâu (hiện đang host free trên Vercel)
- **Trí tuệ nhân tạo**: Tuỳ ý lựa chọn model AI có mặt trên OpenRouter (nếu host local) (trên [AIchambai](https://aichambai.vercel.app/) sử dụng DeepSeek V3)

---

## 📦 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)  
- **AI Backend**: [OpenRouter / DeepSeek V3](https://openrouter.ai/deepseek/deepseek-chat:free)  
- **Env Vars**:  
  - `OPENROUTER_API_KEY`  
  - `ANSWER_KEYS_JSON` (For my presets)
- **Version Control**: Git + GitHub  
- **Hosting**: [Vercel](https://vercel.com/)  

---

## ⚙️ Cấu hình biến môi trường

| Tên biến               | Miêu tả                                                                                                     |
|------------------------|-------------------------------------------------------------------------------------------------------------|
| `OPENROUTER_API_KEY`   | API Key của OpenRouter (DeepSeek V3)                                                                  |
| `ANSWER_KEYS_JSON`     | JSON chứa đáp án mẫu, ví dụ: ```'{"q1":"Nội dung đáp án mẫu...","q2":"…"}```                    |


## 📄 License

AI Mark được phát hành theo [MIT License](./LICENSE).  

---

> **AI Mark** – Áp dụng AI vào giảng dạy, tiết kiệm thời gian chấm bài và nâng cao trải nghiệm học tập! 🚀  
