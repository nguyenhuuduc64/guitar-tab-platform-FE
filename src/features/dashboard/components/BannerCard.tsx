const BannerCard = () => {
    return (
        <div
            className="h-40 md:h-48 rounded-xl p-4 md:p-6 text-white"
            style={{
                background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
            }}
        >
            <p className="text-sm opacity-80">✔ Verified Artist</p>

            <h1 className="text-xl md:text-3xl font-bold mt-2">Taylor Swift</h1>

            <p className="text-xs md:text-sm mt-1 opacity-80">
                45,793,259 monthly listeners
            </p>
        </div>
    );
};

export default BannerCard;
