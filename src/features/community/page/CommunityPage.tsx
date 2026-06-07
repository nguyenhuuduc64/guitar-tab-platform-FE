import { useState } from "react";
import { MessageSquare, Heart, Share2, Music, User } from "lucide-react";
import ChordViewer from "../../../components/common/ChordViewer";

interface Post {
    id: string;
    author: {
        name: string;
        avatar?: string;
        role: string;
    };
    createdAt: string;
    songTitle: string;
    description: string;
    chordContent: string;
    audioUrl?: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
}

export default function CommunityPage() {
    // Dữ liệu mẫu mock data hiển thị danh sách bài chia sẻ
    const [posts, setPosts] = useState<Post[]>([
        {
            id: "post-1",
            author: { name: "Ngọc Trần", role: "Sáng tác tự do" },
            createdAt: "2 giờ trước",
            songTitle: "Chiều Mưa Ngang Qua",
            description: "Mới dùng Sonauto sinh ra đoạn beat Acoustic này, ghép vào lời kèm hợp âm chuẩn Am nghe khá hợp mọi người ạ!",
            chordContent: "[Am]Chiều mưa rơi [F]buốt giá căn phòng [C]trống\n[Dm]Mùi hương xưa [G]nay chỉ còn là hư [C]không [E7]",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            likes: 24,
            comments: 5,
            isLiked: false
        },
        {
            id: "post-2",
            author: { name: "Minh Vũ", role: "Guitarist" },
            createdAt: "5 giờ trước",
            songTitle: "Nắng Sớm",
            description: "Tone G major tươi vui cho ngày mới năng động.",
            chordContent: "[G]Sáng thức giấc thấy [C]ông mặt trời\n[D]Chiếu ánh sáng xuống [G]muôn cuộc đời",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            likes: 42,
            comments: 12,
            isLiked: true
        }
    ]);

    const handleLike = (id: string) => {
        setPosts(prev => prev.map(post => {
            if (post.id === id) {
                return {
                    ...post,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                    isLiked: !post.isLiked
                };
            }
            return post;
        }));
    };

    return (
        <div className="w-full ">


            {/* Feed Danh sách bài viết */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <div key={post.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-col gap-4">

                        {/* 1. Header bài viết: Thông tin người đăng */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 border border-gray-200">
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900 truncate">{post.author.name}</div>
                                <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                                    <span>{post.author.role}</span>
                                    <span>•</span>
                                    <span>{post.createdAt}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tiêu đề bài hát & Mô tả tâm sự */}
                        <div>
                            <h2 className="text-base font-bold text-gray-800 mb-1">🎯 Tác phẩm: {post.songTitle}</h2>
                            <p className="text-sm text-gray-600 leading-relaxed">{post.description}</p>
                        </div>

                        {/* 2. Khung hiển thị Hợp âm bài hát */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                            <ChordViewer
                                chord={{
                                    id: post.id,
                                    title: post.songTitle,
                                    content: post.chordContent
                                }}
                                onOpenPlaylist={() => { }}
                            />
                        </div>

                        {/* 3. Trình phát đoạn nhạc đi kèm (Audio) */}
                        {post.audioUrl && (
                            <div className="bg-purple-50/50 border border-purple-100/70 rounded-xl p-3 flex flex-col gap-2">
                                <div className="text-xs font-semibold text-purple-700 flex items-center gap-1.5">
                                    <Music size={12} className="animate-pulse" /> Đứt đoạn / Bản thu đi kèm:
                                </div>
                                <audio
                                    src={post.audioUrl}
                                    controls
                                    className="w-full h-10 focus:outline-none bg-white rounded-lg shadow-inner text-sm"
                                />
                            </div>
                        )}

                        {/* Thanh tương tác dưới cùng (Like, Comment, Share) */}
                        <div className="flex items-center gap-6 border-t border-gray-50 pt-3 text-gray-500 text-sm font-medium">
                            <button
                                onClick={() => handleLike(post.id)}
                                className={`flex items-center gap-1.5 transition cursor-pointer select-none ${post.isLiked ? 'text-red-500 font-bold' : 'hover:text-red-500'}`}
                            >
                                <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
                                <span>{post.likes}</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-purple-600 transition cursor-pointer select-none">
                                <MessageSquare size={18} />
                                <span>{post.comments}</span>
                            </button>
                            <button className="flex items-center gap-1.5 hover:text-blue-600 transition cursor-pointer select-none ml-auto">
                                <Share2 size={18} />
                                <span>Chia sẻ</span>
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}