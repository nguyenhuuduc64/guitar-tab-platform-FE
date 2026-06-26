export const getYoutubeVideoId = (url: string): string => {
    if (!url) return "";
    try {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return match[2];
        }
        return "";
    } catch {
        return "";
    }
};

export const getYoutubeEmbedUrl = (url: string): string => {
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return "";
};

export const getYoutubeThumbnailUrl = (url: string): string => {
    const videoId = getYoutubeVideoId(url);
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return "";
};

