import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Guitar,
    Music2,
    Star,
    ChevronDown,
    ChevronUp,
    Play,
    Heart,
    BookOpen,
    Fingerprint,
    Sparkles,
    Grid3x3,
    List,
    Search,
    Filter,
    X
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Separator } from "../../../components/ui/separator";
import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import { getAllChords, getChordInfo, type ChordInfo } from "../../../constants/chords";

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

// Chord Interface
interface ChordCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    chords: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ChordDisplay {
    name: string;
    fullName: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    description: string;
    relatedChords: string[];
    songs?: string[];
}

const PostDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const post = POSTS_DATA[slug];

    // State cho phần hợp âm
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
    const [selectedChord, setSelectedChord] = useState<string | null>('C');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFavorites, setShowFavorites] = useState(false);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [expandedChord, setExpandedChord] = useState<string | null>(null);

    // Load favorites from localStorage
    React.useEffect(() => {
        const saved = localStorage.getItem('favorite_chords');
        if (saved) {
            try {
                setFavorites(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading favorites:', e);
            }
        }
    }, []);

    // Save favorites to localStorage
    React.useEffect(() => {
        localStorage.setItem('favorite_chords', JSON.stringify(favorites));
    }, [favorites]);

    const chordCategories: ChordCategory[] = [
        {
            id: 'basic',
            name: 'Hợp âm cơ bản',
            icon: <Star className="w-5 h-5 text-yellow-500" />,
            description: 'Những hợp âm đầu tiên bạn nên học',
            chords: ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'],
            difficulty: 'beginner'
        },
        {
            id: 'major',
            name: 'Hợp âm trưởng (Major)',
            icon: <Music2 className="w-5 h-5 text-blue-500" />,
            description: 'Hợp âm trưởng tạo cảm giác vui tươi, sáng sủa',
            chords: ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'],
            difficulty: 'intermediate'
        },
        {
            id: 'minor',
            name: 'Hợp âm thứ (Minor)',
            icon: <Music2 className="w-5 h-5 text-purple-500" />,
            description: 'Hợp âm thứ tạo cảm giác buồn, sâu lắng',
            chords: ['Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'],
            difficulty: 'intermediate'
        },
        {
            id: 'seventh',
            name: 'Hợp âm 7 (Seventh)',
            icon: <Guitar className="w-5 h-5 text-green-500" />,
            description: 'Hợp âm 7 tạo màu sắc jazz, blues',
            chords: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7', 'Cm7', 'Dm7', 'Em7', 'Fm7', 'Gm7', 'Am7', 'Bm7'],
            difficulty: 'advanced'
        },
        {
            id: 'suspended',
            name: 'Hợp âm Sus (Suspended)',
            icon: <Sparkles className="w-5 h-5 text-orange-500" />,
            description: 'Hợp âm treo tạo cảm giác lơ lửng, chờ đợi',
            chords: ['Csus2', 'Csus4', 'Dsus2', 'Dsus4', 'Esus2', 'Esus4', 'Gsus2', 'Gsus4', 'Asus2', 'Asus4'],
            difficulty: 'advanced'
        },
        {
            id: 'barre',
            name: 'Hợp âm chặn (Barre)',
            icon: <Fingerprint className="w-5 h-5 text-red-500" />,
            description: 'Hợp âm chặn - kỹ thuật nâng cao',
            chords: ['F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm'],
            difficulty: 'advanced'
        }
    ];

    // Get all chord names from constants
    const allChordNames = React.useMemo(() => {
        const chords = getAllChords();
        return chords.map(chord => chord.name);
    }, []);

    const chordDataMap = React.useMemo(() => {
        const map: Record<string, ChordInfo> = {};
        getAllChords().forEach(chord => {
            map[chord.name] = chord;
        });
        return map;
    }, []);

    // Build chord display data
    const chordDisplays: ChordDisplay[] = React.useMemo(() => {
        const displays: ChordDisplay[] = [];

        chordCategories.forEach(category => {
            category.chords.forEach(chordName => {
                const chordInfo = chordDataMap[chordName];
                if (chordInfo) {
                    displays.push({
                        name: chordName,
                        fullName: chordInfo.fullName || chordName,
                        category: category.id,
                        difficulty: category.difficulty,
                        description: chordInfo.description || `${chordName} - ${category.name}`,
                        relatedChords: chordInfo.relatedChords || [],
                        songs: chordInfo.songs || []
                    });
                }
            });
        });

        return displays;
    }, [chordCategories, chordDataMap]);

    // Filter chords
    const filteredChords = React.useMemo(() => {
        let filtered = chordDisplays;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(chord =>
                chord.name.toLowerCase().includes(term) ||
                chord.fullName.toLowerCase().includes(term) ||
                chord.description.toLowerCase().includes(term)
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(chord => chord.category === selectedCategory);
        }

        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(chord => chord.difficulty === selectedDifficulty);
        }

        if (showFavorites) {
            filtered = filtered.filter(chord => favorites.includes(chord.name));
        }

        const unique = new Map<string, ChordDisplay>();
        filtered.forEach(chord => {
            if (!unique.has(chord.name)) {
                unique.set(chord.name, chord);
            }
        });

        return Array.from(unique.values());
    }, [chordDisplays, searchTerm, selectedCategory, selectedDifficulty, showFavorites, favorites]);

    const categories = React.useMemo(() => {
        const catMap = new Map<string, ChordCategory>();
        chordCategories.forEach(cat => catMap.set(cat.id, cat));
        return Array.from(catMap.values());
    }, [chordCategories]);

    const toggleFavorite = (chordName: string) => {
        setFavorites(prev =>
            prev.includes(chordName)
                ? prev.filter(f => f !== chordName)
                : [...prev, chordName]
        );
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'advanced': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'Cơ bản';
            case 'intermediate': return 'Trung cấp';
            case 'advanced': return 'Nâng cao';
            default: return 'Khác';
        }
    };

    const getCategoryIcon = (categoryId: string) => {
        const cat = chordCategories.find(c => c.id === categoryId);
        return cat?.icon || <Music2 className="w-4 h-4" />;
    };

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
        <main className="p-4 min-h-screen bg-white dark:bg-gray-900">
            <article className="rounded-sm max-w-4xl mx-auto">
                <header className="mb-8 border-b pb-6 dark:border-gray-700">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center text-sm text-gray-400 font-medium">
                        <span className="px-2 py-1 rounded mr-3 uppercase text-xs">
                            Cẩm nang
                        </span>
                        <span>Cập nhật: {post.date}</span>
                    </div>
                </header>

                <div className="space-y-10">
                    {post.sections.map((section, index) => (
                        <section key={index}>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 border-l-4 pl-4 dark:border-gray-600">
                                {section.heading}
                            </h2>
                            <div className="text-gray-600 dark:text-gray-300 leading-8 text-lg whitespace-pre-line pl-5">
                                {section.content.trim()}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Phần Hợp Âm Guitar */}
                <div className="mt-16 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-6">
                        <Guitar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Hợp âm Guitar - Từ điển và hướng dẫn
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tất cả hợp âm guitar cơ bản và nâng cao cho người mới bắt đầu
                            </p>
                        </div>
                    </div>

                    {/* Chord Search and Filters */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Tìm hợp âm (ví dụ: C, Am, G7...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFavorites(!showFavorites)}
                                className={showFavorites ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400' : ''}
                            >
                                <Star className={`w-4 h-4 mr-1 ${showFavorites ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                Yêu thích
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            >
                                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Button
                            variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                            size="xs"
                            onClick={() => setSelectedDifficulty('all')}
                        >
                            Tất cả
                        </Button>
                        <Button
                            variant={selectedDifficulty === 'beginner' ? 'default' : 'outline'}
                            size="xs"
                            onClick={() => setSelectedDifficulty('beginner')}
                            className="border-green-200 dark:border-green-800"
                        >
                            🟢 Cơ bản
                        </Button>
                        <Button
                            variant={selectedDifficulty === 'intermediate' ? 'default' : 'outline'}
                            size="xs"
                            onClick={() => setSelectedDifficulty('intermediate')}
                            className="border-yellow-200 dark:border-yellow-800"
                        >
                            🟡 Trung cấp
                        </Button>
                        <Button
                            variant={selectedDifficulty === 'advanced' ? 'default' : 'outline'}
                            size="xs"
                            onClick={() => setSelectedDifficulty('advanced')}
                            className="border-red-200 dark:border-red-800"
                        >
                            🔴 Nâng cao
                        </Button>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="flex gap-1 overflow-x-auto">
                            <Button
                                variant={!selectedCategory ? 'default' : 'outline'}
                                size="xs"
                                onClick={() => setSelectedCategory(null)}
                            >
                                📚 Tất cả
                            </Button>
                            {categories.map(cat => (
                                <Button
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    size="xs"
                                    onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                >
                                    {cat.icon}
                                    <span className="ml-1 hidden sm:inline">{cat.name.split(' ')[0]}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Chord Grid */}
                    {filteredChords.length === 0 ? (
                        <Card className="p-8 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                                    Không tìm thấy hợp âm
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory(null);
                                        setSelectedDifficulty('all');
                                        setShowFavorites(false);
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        </Card>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredChords.map((chord) => (
                                <Card
                                    key={chord.name}
                                    className={`hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800 ${selectedChord === chord.name ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                                        }`}
                                    onClick={() => setSelectedChord(selectedChord === chord.name ? null : chord.name)}
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                    {chord.name}
                                                    {favorites.includes(chord.name) && (
                                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    )}
                                                </CardTitle>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {chord.fullName}
                                                </p>
                                            </div>
                                            <Badge className={getDifficultyColor(chord.difficulty)}>
                                                {getDifficultyLabel(chord.difficulty)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-24 shrink-0">
                                                <GuitarChordDiagram initialChordName={chord.name} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {chord.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {chord.relatedChords.slice(0, 3).map(related => (
                                                        <Badge
                                                            key={related}
                                                            variant="outline"
                                                            className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSearchTerm(related);
                                                            }}
                                                        >
                                                            {related}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between pt-0">
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(chord.name);
                                            }}
                                            className="text-gray-400 hover:text-yellow-500"
                                        >
                                            <Star className={`w-4 h-4 ${favorites.includes(chord.name) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                            {favorites.includes(chord.name) ? ' Bỏ yêu thích' : ' Yêu thích'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedChord(expandedChord === chord.name ? null : chord.name);
                                            }}
                                        >
                                            {expandedChord === chord.name ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        // List view
                        <div className="space-y-2">
                            {filteredChords.map((chord) => (
                                <div
                                    key={chord.name}
                                    className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all p-3 cursor-pointer ${selectedChord === chord.name ? 'ring-2 ring-indigo-500 shadow-lg' : ''
                                        }`}
                                    onClick={() => setSelectedChord(selectedChord === chord.name ? null : chord.name)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 shrink-0">
                                            <GuitarChordDiagram initialChordName={chord.name} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-lg dark:text-white">{chord.name}</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{chord.fullName}</span>
                                                <Badge className={getDifficultyColor(chord.difficulty)}>
                                                    {getDifficultyLabel(chord.difficulty)}
                                                </Badge>
                                                {favorites.includes(chord.name) && (
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                                {chord.description}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {chord.relatedChords.slice(0, 5).map(related => (
                                                    <Badge
                                                        key={related}
                                                        variant="outline"
                                                        className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSearchTerm(related);
                                                        }}
                                                    >
                                                        {related}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(chord.name);
                                            }}
                                            className="shrink-0"
                                        >
                                            <Star className={`w-5 h-5 ${favorites.includes(chord.name) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                                        </Button>
                                    </div>

                                    {/* Expanded details */}
                                    {expandedChord === chord.name && (
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                        Hợp âm liên quan
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {chord.relatedChords.map(related => (
                                                            <Badge
                                                                key={related}
                                                                variant="outline"
                                                                className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSearchTerm(related);
                                                                }}
                                                            >
                                                                {related}
                                                            </Badge>
                                                        ))}
                                                        {chord.relatedChords.length === 0 && (
                                                            <span className="text-sm text-gray-400">Không có</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                                        Bài hát gợi ý
                                                    </h4>
                                                    {chord.songs && chord.songs.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {chord.songs.map(song => (
                                                                <Badge
                                                                    key={song}
                                                                    variant="secondary"
                                                                    className="cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                                                >
                                                                    {song}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">Chưa có gợi ý</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Learning Tips */}
                    <div className="mt-8">
                        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                    <BookOpen className="w-5 h-5" />
                                    Mẹo học hợp âm cho người mới
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm dark:text-white">Bắt đầu với hợp âm cơ bản</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Học C, G, D, A, E, Am, Em, Dm trước - đây là những hợp âm phổ biến nhất
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm dark:text-white">Luyện tập chuyển hợp âm</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Tập chuyển đổi giữa các hợp âm mà không nhìn tay để tăng tốc độ
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm dark:text-white">Học theo bài hát</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Áp dụng hợp âm vào bài hát yêu thích để nhớ lâu hơn và thú vị hơn
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <footer className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <span className="mr-2">←</span> Quay lại
                    </button>
                    <div className="flex gap-4">
                        <span className="text-xs text-gray-300 dark:text-gray-600">#guitar</span>
                        <span className="text-xs text-gray-300 dark:text-gray-600">#tutorial</span>
                    </div>
                </footer>
            </article>
        </main>
    );
};

export default PostDetailPage;