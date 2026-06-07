# CẨM NANG NHẠC LÝ GUITAR & QUY TẮC PHỐI HỢP ÂM (AI PROMPT REFERENCE)

Tài liệu này cung cấp toàn bộ hệ thống nhạc lý, quy luật vòng hòa âm, cấu trúc cảm xúc và định dạng dữ liệu chuẩn hóa để mô hình AI (LLM) phân tích ngữ nghĩa lời bài hát và tự động chèn hợp âm Guitar chính xác theo thời gian thực (Lyrics-to-Chords).

---

## 1. HỆ THỐNG ĐỊNH DANH HỢP ÂM CƠ BẢN (CHORD SYMBOLS)
AI bắt buộc phải sử dụng các ký hiệu chuẩn quốc tế sau để chèn vào văn bản:
* **Hợp âm Trưởng (Major):** C (Đô Trưởng), D (Rê Trưởng), E (Mi Trưởng), F (Fa Trưởng), G (Sol Trưởng), A (La Trưởng), B (Si Trưởng).
* **Hợp âm Thứ (Minor):** Cm, Dm, Em, Fm, Gm, Am, Bm.
* **Hợp âm 7 (Dominant 7th / Minor 7th):** C7, D7, E7, G7, A7, Am7, Bm7, Em7.
* **Ký hiệu Biến âm:** `#` (Thăng - nâng lên 1/2 cung), `b` (Giáng - hạ xuống 1/2 cung). Ví dụ: F#, Bb, C#m.

---

## 2. QUY LUẬT VÒNG HÒA ÂM PHỔ BIẾN (CHORD PROGRESSIONS)
Dựa vào tâm trạng (Mood) của lời bài hát, AI chọn 1 trong các vòng hòa âm kinh điển sau dưới tone gốc **C Trưởng (C)** hoặc **A Thứ (Am)**, sau đó dùng thuật toán tịnh tiến để dịch giọng (Transpose) nếu cần.

### 2.1. Vòng Hòa Âm Nhạc Pop/Ballad Tươi Sáng, Tích Cực (Tone C Trưởng)
* **Công thức bậc:** I - V - vi - IV
* **Chuỗi hợp âm:** `C - G - Am - F`
* **Ứng dụng ngữ cảnh:** Lời bài hát về tình yêu, niềm vui, hy vọng, khởi đầu mới.

### 2.2. Vòng Hòa Âm Nhạc Trầm Buồn, Sâu Lắng (Tone A Thứ)
* **Công thức bậc:** i - VI - III - VII
* **Chuỗi hợp âm:** `Am - F - C - G`
* **Ứng dụng ngữ cảnh:** Lời bài hát về sự chia ly, cô đơn, nỗi buồn, hoài niệm.

### 2.3. Vòng Hòa Âm Canon Kinh Điển (Tạo cảm xúc cao trào, da diết)
* **Chuỗi hợp âm:** `C - G - Am - Em - F - C - F - G`
* **Ứng dụng ngữ cảnh:** Đoạn điệp khúc (Chorus) cần sự bùng nổ cảm xúc hoặc các bài hát tự sự dài.

### 2.4. Vòng Hòa Âm Bossa Nova / Jazz Nhẹ Nhàng, Thư Giãn
* **Chuỗi hợp âm:** `Dm7 - G7 - Cmaj7 - A7`
* **Ứng dụng ngữ cảnh:** Lời bài hát chill, không gian nhẹ nhàng, lãng mạn mộc mạc.

---

## 3. MỐI TƯƠNG QUAN GIỮA NGỮ NGHĨA VĂN BẢN VÀ HỢP ÂM (MOOD-TO-CHORD RULES)
AI phải phân tích từ khóa (Keywords) trong câu hát để chuyển đổi hợp âm phù hợp:

| Tần số cảm xúc / Từ khóa trong lời | Loại hợp âm ưu tiên | Ví dụ |
| :--- | :--- | :--- |
| Vui vẻ, nắng rực rỡ, nụ cười, ngày mai, hạnh phúc | Trưởng (Major) | C, G, D |
| Mưa rơi, nước mắt, cô đơn, màn đêm, ký ức, nghẹn ngào | Thứ (Minor) | Am, Em, Dm |
| Chông chênh, hoài nghi, câu hỏi, nút thắt cảm xúc | Hợp âm 7 (7th) | E7, A7, Bm7 |
| Kết thúc câu hỏi, chuẩn bị sang đoạn điệp khúc bùng nổ | Hợp âm át (Dominant) | G7 (về C), E7 (về Am) |

---

## 4. QUY TRÌNH PHÂN TÍCH VÀ ĐỊNH VỊ HỢP ÂM ĐÚNG VỊ TRÍ (ANCHORING RULES)
Khi AI khởi tạo lời bài hát kèm hợp âm, bắt buộc phải tuân thủ nghiêm ngặt quy tắc định dạng **Inline Chords** (Hợp âm nằm trong ngoặc vuông và đặt ngay **TRƯỚC** chữ cái bắt đầu của phách mạnh/từ khóa thay đổi hòa âm):

### 4.1. Quy tắc phách trong ô nhịp (Nhịp 4/4 thông thường)
* Một câu hát thường có 2 hoặc 4 phách mạnh cần đổi hợp âm.
* Hợp âm đầu câu phải đặt ngay ký tự đầu tiên của câu.
* Hợp âm tiếp theo đặt ở giữa câu tại vị trí từ mang trọng âm.

### 4.2. Ví dụ mẫu định dạng chuẩn (Mục tiêu đầu ra của AI):
```text
[C] Ngày nắng xanh ngời [G] em bước qua thềm
[Am] Lòng bỗng nhẹ nhàng [F] vương chút hương đêm
[Dm7] Có phải chăng là [G7] duyên số đôi mình [C] thôi