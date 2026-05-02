const data = [1, 2, 3, 4];

const CardList = () => {
    return (
        <div>
            <h2 className="font-semibold mb-4 text-lg">Popular</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition"
                    >
                        <img
                            src={`https://picsum.photos/300/200?random=${i}`}
                            className="w-full h-32 object-cover"
                        />
                        <div className="p-3">
                            <p className="text-sm font-medium">
                                Fleet – Travel UI
                            </p>
                            <p className="text-xs text-gray-500">
                                Taylor Swift
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CardList;
