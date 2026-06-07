import { useNavigate } from "react-router-dom";
import ButtonCustom from "../../../components/ui/ButtonCustom";
import { faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";

export const Hero = () => {
    const navigate = useNavigate();

    const handleGoToAIPage = () => {
        navigate("/ai"); // Chuyển hướng sang trang AI mới
    };

    return (
        <section className="relative border border-border-subtle bg-white p-6 mb-5 flex flex-col items-center justify-center text-center py-12">
            <div className="absolute top-0 left-0 h-[2px] w-16 bg-primary" />
            
            <h1 className="mb-2 text-2xl font-bold uppercase tracking-wide">
                Trợ lý Sáng tác & Gợi ý Hợp âm AI
            </h1>
            
            <p className="mb-6 max-w-xl text-sm text-gray-500">
                Khám phá bộ công cụ trí tuệ nhân tạo thế hệ mới giúp bạn tự động hóa quy trình tạo lời, phối vòng hòa âm Guitar và định hình giai điệu từ ý tưởng thô.
            </p>

            <ButtonCustom
                onClick={handleGoToAIPage}
                name="Thử nghiệm Trợ lý AI ngay"
                icon={faMagicWandSparkles}
                variant="primary"
                className="px-6 py-2 font-medium"
            />
        </section>
    );
};