# AI Mark – 🌟 Tự Động Chấm Bài Tự Luận Bằng AI

> **AI Mark** là web app giúp giáo viên và học sinh tự động chấm điểm bài tự luận và nhận xét bằng trí tuệ nhân tạo **Meta: Llama 3.2 3B Instruct** – miễn phí, nhanh chóng và bảo mật.

---

## 🔥 Tính năng nổi bật

- **Chấm điểm tự động** theo tỷ lệ phần trăm (0–100%)  
- **Nhận xét khái quát** 1–2 câu cho mỗi bài làm  
- **Loading spinner** sinh động khi chờ AI chấm bài  
- **Giao diện hiện đại**: Next.js + Tailwind CSS + gradient background  
- **Triển khai dễ dàng**: host miễn phí trên Vercel hoặc VPS/Cloud của bạn  

---

## 📦 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)  
- **AI Backend**: [OpenRouter / Meta: Llama 3.2 3B Instruct](https://openrouter.ai)  
- **Env Vars**:  
  - `OPENROUTER_API_KEY`  
  - `ANSWER_KEYS_JSON`  
- **Version Control**: Git + GitHub  
- **Hosting**: [Vercel](https://vercel.com/)  

---

## ⚙️ Cấu hình biến môi trường
- Đây là một điểm yếu của project này khi Answer Keys được để vào theo dạng Environment Variables

| Tên biến               | Miêu tả                                                                                                     |
|------------------------|-------------------------------------------------------------------------------------------------------------|
| `OPENROUTER_API_KEY`   | API Key của OpenRouter (Meta: Llama 3.2 3B Instruct)                                                                  |
| `ANSWER_KEYS_JSON`     | JSON chứa đáp án mẫu, ví dụ: ```'{"q1":"Nội dung đáp án mẫu...","q2":"…"}```                    |


## 📄 License

AI Mark được phát hành theo [MIT License](./LICENSE).  

---

> **AI Mark** – Áp dụng AI vào giảng dạy, tiết kiệm thời gian chấm bài và nâng cao trải nghiệm học tập! 🚀  
