import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { X, Loader2, Music, Send, User } from "lucide-react";
import instance from "../../../config/axios";
import { getUserInfo } from "../../../utils/auth";

interface Audio {
    id: string;
    url: string;
    chordId: string;
}

interface Chord {
    id: string;
    title: string;
    content: string;
    artistName: string;
}

interface AudioWithChord extends Audio {
    chordTitle?: string;
    artistName?: string;
}

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess: () => void;
}

export function CreatePostModal({ isOpen, onClose, userId, onSuccess }: CreatePostModalProps) {
    const [content, setContent] = useState<string>("");
    const [selectedAudioId, setSelectedAudioId] = useState<string>("");
    const [audios, setAudios] = useState<AudioWithChord[]>([]);
    const [selectedChord, setSelectedChord] = useState<Chord | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const info = await getUserInfo();
            setUserInfo(info);
        };
        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserAudios();
        }
    }, [isOpen, userId]);

    useEffect(() => {
        if (selectedAudioId) {
            fetchChordByAudioId(selectedAudioId);
        } else {
            setSelectedChord(null);
        }
    }, [selectedAudioId]);

    const fetchUserAudios = async () => {
        try {
            setIsLoading(true);
            const res = await instance.get(`/audios/user/${userId}`);
            const audioData = res.data.result || [];

            const audioWithChord = await Promise.all(
                audioData.map(async (audio: Audio) => {
                    try {
                        const chordRes = await instance.get(`/chords/${audio.chordId}`);
                        return {
                            ...audio,
                            chordTitle: chordRes.data.result?.title || "Không có tiêu đề",
                            artistName: chordRes.data.result?.artistName || "Không có nghệ sĩ"
                        };
                    } catch (error) {
                        console.error(`Error fetching chord for audio ${audio.id}:`, error);
                        return {
                            ...audio,
                            chordTitle: "Không tìm thấy bài hát",
                            artistName: ""
                        };
                    }
                })
            );

            setAudios(audioWithChord);
        } catch (error) {
            console.error("Error fetching audios:", error);
            setAudios([]);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChordByAudioId = async (audioId: string) => {
        try {
            const audio = audios.find(a => a.id === audioId);
            if (audio) {
                const res = await instance.get(`/chords/${audio.chordId}`);
                setSelectedChord(res.data.result);
            }
        } catch (error) {
            console.error("Error fetching chord:", error);
            setSelectedChord(null);
        }
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.warn("Vui lòng nhập nội dung bài đăng");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                content: content,
                userId: userId,
                audioId: selectedAudioId || null,
            };

            const response = await instance.post("/posts", payload);

            if (response.data) {
                onSuccess();
                onClose();
                resetForm();
            }
        } catch (error: any) {
            console.error("Error creating post:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo bài đăng");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setContent("");
        setSelectedAudioId("");
        setSelectedChord(null);
    };

    const getDisplayName = (audio: AudioWithChord) => {
        if (audio.chordTitle && audio.artistName) {
            return `${audio.chordTitle} - ${audio.artistName}`;
        } else if (audio.chordTitle) {
            return audio.chordTitle;
        } else {
            const urlParts = audio.url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            return fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-transparent dark:border-slate-800">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tạo bài đăng mới</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer border-none outline-none"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-slate-855/30 rounded-lg border border-transparent dark:border-slate-800/40">
                        {userInfo?.imageUrl ? (
                            <img
                                src={userInfo.imageUrl}
                                alt={userInfo.fullName || userInfo.username || "User"}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-indigo-600" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {userInfo?.fullName || userInfo?.username || "Người dùng"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">Đang tạo bài đăng</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-350 mb-2">
                                Nội dung bài đăng
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Bạn đang nghĩ gì?..."
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none min-h-[120px] text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-slate-350 mb-2">
                                Chọn audio (tùy chọn)
                            </label>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                </div>
                            ) : audios.length === 0 ? (
                                <div className="text-center py-4 bg-gray-50 dark:bg-slate-855/20 rounded-lg border border-dashed border-gray-300 dark:border-slate-800">
                                    <Music className="w-8 h-8 text-gray-400 dark:text-slate-600 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-slate-450">Bạn chưa có audio nào</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">Hãy tạo audio trước khi đăng bài</p>
                                </div>
                            ) : (
                                <select
                                    value={selectedAudioId}
                                    onChange={(e) => setSelectedAudioId(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-white"
                                >
                                    <option value="">-- Không chọn audio --</option>
                                    {audios.map((audio) => (
                                        <option key={audio.id} value={audio.id}>
                                            🎵 {getDisplayName(audio)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {selectedChord && (
                            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
                                        🎵 Bài hát được chọn
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setSelectedAudioId("");
                                            setSelectedChord(null);
                                        }}
                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer border-none outline-none bg-transparent"
                                    >
                                        Bỏ chọn
                                    </button>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                                    {selectedChord.title}
                                </p>
                                {selectedChord.artistName && (
                                    <p className="text-sm text-gray-600 dark:text-slate-400">
                                        Nghệ sĩ: {selectedChord.artistName}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-slate-800">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className="w-full px-6 py-3 bg-[--primary-color] hover:bg-[--primary-color]/90 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        style={{ backgroundColor: 'var(--primary-color, #4f46e5)' }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang đăng...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Đăng bài
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}