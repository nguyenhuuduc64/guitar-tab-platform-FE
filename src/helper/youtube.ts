export const getYoutubeEmbedUrl = (url: string) => {
    try {
        const parsed = new URL(url);

        // youtube.com/watch?v=
        const videoId = parsed.searchParams.get("v");

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }

        // youtu.be/
        if (parsed.hostname.includes("youtu.be")) {
            return `https://www.youtube.com/embed${parsed.pathname}`;
        }

        return "";
    } catch {
        return "";
    }
};
