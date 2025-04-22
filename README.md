# AI Mark – 🌟 Tự Động Chấm Bài Tự Luận Bằng AI

> **AI Mark** là web app giúp giáo viên và học sinh tự động chấm điểm và nhận xét bài tự luận bằng trí tuệ nhân tạo **DeepSeek V3**  – hoàn toàn **miễn phí**, **nhanh chóng** và **bảo mật**.

---

## 🔥 Tính năng nổi bật

- ### Chấm điểm & nhận xét tự động  
  - Cho điểm theo phần trăm (0–100%)  
  - Viết nhận xét khái quát, kèm gợi ý cải thiện, hỗ trợ giáo dục học sinh

- ### Tuỳ biến bộ câu hỏi & quản lý  
  - Chọn giữa các **preset** có sẵn hoặc tạo/bổ sung bộ mới  
  - **Thêm / Xoá / Đổi tên** bộ câu hỏi, lưu thẳng vào `localStorage` của trình duyệt  
  - **Hoàn tác (Ctrl+Z)** khi chỉnh sửa nội dung từng câu  

- ### Nhập liệu bằng AI  
  - “Nhập liệu bằng AI” – upload file (`.txt`, `.docx`)  
  - AI tự động **tách** văn bản thành các cặp **Câu hỏi – Đáp án mẫu**  
  - AI gợi ý luôn **tên bộ câu hỏi** phù hợp  

- ### Import / Export linh hoạt  
  - Hỗ trợ file `.txt` & `.docx` (có thể mở rộng thêm)  
  - Có thể xử lý đa dạng file dù không theo định dạng nào nhờ trí tuệ nhân tạo

- ### Đồng bộ và lưu dữ liệu theo tài khoản
  - Hỗ trợ đăng nhập bằng email/Google/Github an toàn qua Firebase Authentication
  - Các bộ câu hỏi được lưu và đồng bộ hoá theo từng tài khoản
  - Bộ câu hỏi cũng đồng thời được lưu vào trình duyệt, tránh rủi ro mất dữ liệu trong quá trình lưu

- ### Giao diện & UX hiện đại  
  - **Auto‑resize** textarea, spinner vui nhộn khi chấm bài  
  - Next.js + Tailwind CSS, responsive, màu sắc tươi sáng  
  - Lướt mượt, thao tác đơn giản  

---

## 📖 Hướng dẫn sử dụng

1. **Chọn bộ câu hỏi** từ dropdown:  
   – Preset có sẵn hoặc bộ bạn đã tạo trước đó.  
2. Nhấn **Chỉnh sửa** để:  
   – Đổi tên bộ, thêm/xóa/sửa nội dung câu hỏi & đáp án.  
   – Hoàn tác sai sót bằng **Ctrl+Z**.  
3. Nhấn **+ Thêm bộ mới**:  
   – Tạo bộ trống và tự động mở giao diện chỉnh sửa.  
4. Nhấn **Nhập liệu bằng AI**:  
   – Upload file `.txt` / `.docx` → đợi AI tách & gợi ý tên bộ.  
5. Trên màn hình Quiz:  
   – Nhập câu trả lời vào từng ô trả lời. 
   – Nhấn **Chấm** để AI chấm điểm.
   – Xem kết quả ngay bên dưới từng câu.  

---

## 📦 Tech Stack

- **Framework**: Next.js (React)  
- **Styling**: Tailwind CSS  
- **AI Backend**: OpenRouter / DeepSeek  
- **DOCX Parser**: Mammoth.js  
- **Local Persistence**: `localStorage` (client‑side)  
- **Version Control**: Git + GitHub  
- **Hosting**: Vercel  

---

## ⚙️ Biến môi trường

| Tên biến               | Miêu tả                                                         |
|------------------------|-----------------------------------------------------------------|
| `OPENROUTER_API_KEY`   | API Key truy cập OpenRouter (DeepSeek model)                    |

---

## 🔮 Định hướng tương lai

- **Mở rộng input**: hỗ trợ thêm PDF, Markdown, Excel…  
- **Chia sẻ & export**: xuất PDF/CSV kết quả chấm bài và bộ câu hỏi  
- **Nâng cao UI**: Dark mode, theme tuỳ chọn  

---

## 📄 License

Phát hành theo [MIT License](./LICENSE).  

> **AI Mark** – Áp dụng AI vào giảng dạy, tiết kiệm thời gian chấm bài và nâng cao trải nghiệm học tập! 🚀  
