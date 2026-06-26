import { useNavigate } from "react-router-dom";
import { User, Music } from "lucide-react";
import { type Artist } from "../../types/artist";

interface ArtistSliderProps {
    title: string;
    artists: Artist[];
    emptyText?: string;
    useMusicIcon?: boolean;
    hasBorder?: boolean;
    roundedEmptyCard?: boolean;
}

export const ArtistSlider = ({
    title,
    artists,
    emptyText = "Chưa có nghệ sĩ nào",
    useMusicIcon = false,
    hasBorder = true,
    roundedEmptyCard = false,
}: ArtistSliderProps) => {
    const navigate = useNavigate();

    // Drag-to-Scroll Event Handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        container.dataset.isDown = "true";
        container.dataset.startX = e.pageX.toString();
        container.dataset.scrollLeft = container.scrollLeft.toString();
        container.dataset.hasMoved = "false";
    };

    const handleMouseLeaveOrUp = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        container.dataset.isDown = "false";
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        if (container.dataset.isDown !== "true") return;
        const startX = parseFloat(container.dataset.startX || "0");
        const distance = Math.abs(e.pageX - startX);
        if (distance > 5) {
            container.dataset.hasMoved = "true";
        }
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const containerStartX = startX - container.offsetLeft;
        const scrollLeft = parseFloat(container.dataset.scrollLeft || "0");
        const walk = (x - containerStartX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    };

    const handleArtistCardClick = (artistId: string, e: React.MouseEvent) => {
        const container = e.currentTarget.parentElement;
        if (container && container.dataset.hasMoved === "true") {
            return;
        }
        navigate(`/nghe-sy/${artistId}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                    {title}
                </h2>
            </div>

            {artists.length === 0 ? (
                <div className={`p-8 text-center text-slate-400 text-sm border border-slate-100 dark:border-slate-800 bg-white ${
                    roundedEmptyCard ? "rounded-2xl dark:bg-slate-900/40" : "rounded-none dark:bg-slate-900"
                }`}>
                    {emptyText}
                </div>
            ) : (
                <div
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                    className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide select-none cursor-grab active:cursor-grabbing"
                >
                    {artists.map((artist) => (
                        <div
                            key={artist.id}
                            onClick={(e) => handleArtistCardClick(artist.id, e)}
                            className="w-[140px] sm:w-[150px] shrink-0 flex flex-col items-start bg-transparent border-0 cursor-pointer select-none group transition-transform duration-300 hover:scale-[1.02]"
                        >
                            {/* Circular Image Container */}
                            <div className={`w-full aspect-square rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm relative ${
                                hasBorder ? "border border-slate-200/60 dark:border-slate-700/60" : ""
                            }`}>
                                {artist.imageUrl ? (
                                    <img
                                        src={artist.imageUrl}
                                        alt={artist.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        draggable={false}
                                    />
                                ) : useMusicIcon ? (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-slate-800 dark:to-slate-900">
                                        <Music className="w-8 h-8 text-indigo-300 dark:text-slate-650" />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-slate-800 dark:to-slate-900">
                                        <User size={36} className="text-indigo-300 dark:text-slate-650" />
                                    </div>
                                )}
                            </div>

                            {/* Text Info Below Image */}
                            <div className="w-full mt-3 text-left">
                                <h3 className="font-bold text-slate-850 dark:text-white text-xs sm:text-sm truncate w-full group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                                    {artist.name}
                                </h3>
                                <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                    Nghệ sĩ
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
