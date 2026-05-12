const uploadImageToCloudinary = async (file) => {
    try {
        console.log("📥 INPUT FILE:", file);
        console.log(
            "📌 File type check:",
            file instanceof File ? "OK (File)" : typeof file,
        );

        if (!(file instanceof File)) {
            console.error("❌ Không phải File hợp lệ");
            return null;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "luan_van");

        console.log("🚀 Start uploading to Cloudinary...");

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/dnecovspp/image/upload",
            {
                method: "POST",
                body: formData,
            },
        );

        console.log("📡 RESPONSE STATUS:", response.status);

        const data = await response.json();

        console.log("📡 CLOUDINARY RAW RESPONSE:", data);

        if (!response.ok) {
            console.error("❌ Cloudinary upload failed:");
            console.error(data?.error?.message || data);
            return null;
        }

        if (!data.secure_url) {
            console.error("❌ Không có secure_url trong response");
            console.log("FULL DATA:", data);
            return null;
        }

        console.log("✅ UPLOAD SUCCESS URL:", data.secure_url);

        return data.secure_url;
    } catch (error) {
        console.error("❌ Upload exception:", error);
        return null;
    }
};

export default uploadImageToCloudinary;
