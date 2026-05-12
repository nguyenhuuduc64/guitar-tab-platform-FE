import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const POSTS_DATA = {
    "cach-choi-guitar-cho-nguoi-moi-bat-dau": {
        title: "Lựa chọn đàn Guitar phù hợp cho người mới",
        date: "24/03/2026",
        sections: [
            {
                heading: "1. So sánh Guitar Classic và Acoustic",
                content: `Với người mới, việc chọn đúng cây đàn Guitar đầu tiên có ý nghĩa rất lớn. Hai loại phổ biến nhất là Guitar Classic và Guitar Acoustic. 
                
Đàn Classic thường sử dụng dây nylon, mang lại cảm giác êm ái hơn cho đầu ngón tay. Ngược lại, Guitar Acoustic sử dụng dây kim loại, cho âm thanh vang và sáng hơn, thường được ưa chuộng trong đệm hát hiện đại.

Kinh nghiệm cho thấy nhiều bạn cảm thấy thoải mái hơn khi bắt đầu với dây nylon của đàn Classic vì độ mềm mại và ít gây đau đầu ngón tay hơn. Sau khi đã quen, việc chuyển sang đàn Acoustic sẽ dễ dàng hơn.`,
            },
            {
                heading: "2. Phụ kiện cần thiết khi bắt đầu",
                content: `• Capo: Dùng để kẹp lên các ngăn đàn, giúp tăng tông bài hát.
• Pick (Miếng gảy): Dùng để tạo ra âm thanh to và rõ hơn. Với người mới, nên chọn pick có độ dày trung bình.
• Máy lên dây (Tuner): Rất quan trọng để đảm bảo đàn luôn đúng cao độ. Có thể dùng máy kẹp hoặc ứng dụng điện thoại.`,
            },
            {
                heading: "3. Cách lên dây đàn Guitar chuẩn xác",
                content: `Hầu hết các bài hát sử dụng Standard Tuning EADGBe (từ dây 6 đến dây 1): 
Mì (E) – La (A) – Rê (D) – Sol (G) – Si (B) – Mí (e).

Các bước sử dụng Tuner:
1. Gảy từng dây một, bắt đầu từ dây số 6.
2. Quan sát kim lệch: Nếu lệch trái (thấp), vặn căng dây; lệch phải (cao), nới lỏng dây.
3. Chỉnh đến khi kim chỉ đúng vào giữa và hiển thị đúng tên nốt.`,
            },
            {
                heading: "4. Nền tảng cần nắm vững",
                content: `• Tư thế ngồi: Ngồi thẳng lưng, không gù. Với Classic, đặt đàn lên đùi trái và kê cao chân. Với Acoustic, đặt lên đùi phải.
• Kỹ thuật tay trái: Các ngón tay nên đặt vuông góc với mặt cần đàn. Bấm sát về phía thanh kim loại (fret) để tránh tiếng rè.
• Kỹ thuật tay phải: Sử dụng chuyển động linh hoạt của cổ tay thay vì cả cánh tay khi quạt chả (strumming).`,
            },
            {
                heading: "5. Lộ trình luyện tập hiệu quả",
                content: `Bắt đầu với các hợp âm mở (Open Chords): C, G, D, E, A (Trưởng) và Am, Em, Dm (Thứ). 
Hãy tập chuyển đổi giữa các cặp hợp âm thường gặp như G-C, C-Am bằng cách sử dụng Metronome ở tốc độ chậm để giữ nhịp ổn định.`,
            },
        ],
    },
    "cach-dem-hat-guitar-can-ban": {
        title: "Hướng dẫn cách đệm hát Guitar căn bản",
        date: "25/03/2026",
        sections: [
            {
                heading: "Các điệu đệm phổ biến",
                content: `• Điệu Slow: Thường dùng cho nhạc trữ tình (Bass - Chát Chach).
• Điệu Blue/Slow Rock: Phổ biến cho nhạc trẻ (Bass - Chát - Bùm - Chát).
• Điệu Ballad: Phổ biến nhất, nhịp 4/4.`,
            },
        ],
    },
};

const PostDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const post = POSTS_DATA[slug];

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <p className="text-gray-500 mb-4">Bài viết không tồn tại.</p>
                <button
                    onClick={() => navigate("/")}
                    className="text-blue-600 hover:underline"
                >
                    Về trang chủ
                </button>
            </div>
        );
    }

    return (
        <main className="p-4 min-h-screen bg-white">
            <article className="rounded-sm">
                <header className="mb-8 border-b pb-6">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center text-sm text-gray-400 font-medium">
                        <span className=" px-2 py-1 rounded mr-3 uppercase text-xs">
                            Cẩm nang
                        </span>
                        <span>Cập nhật: {post.date}</span>
                    </div>
                </header>

                <div className="space-y-10">
                    {post.sections.map((section, index) => (
                        <section key={index}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 pl-4">
                                {section.heading}
                            </h2>
                            <div className="text-gray-600 leading-8 text-lg whitespace-pre-line pl-5">
                                {section.content.trim()}
                            </div>
                        </section>
                    ))}
                </div>

                <footer className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        <span className="mr-2">←</span> Quay lại
                    </button>
                    <div className="flex gap-4">
                        <span className="text-xs text-gray-300">#guitar</span>
                        <span className="text-xs text-gray-300">#tutorial</span>
                    </div>
                </footer>
            </article>
        </main>
    );
};

export default PostDetailPage;
