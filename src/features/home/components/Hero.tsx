import ButtonCustom from "../../../components/ui/ButtonCustom";
import { faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
export const Hero = () => {
    return (
        <section className="border border-border-subtle bg-card-inner rounded-sm p-8 transition-colors bg-white">
            <h1 className="text-2xl font-bold mb-2 text-main-fg">
                Sáng tạo âm nhạc với AI
            </h1>
            <p className="text-sm text-main-fg opacity-50 mb-6">
                Dán lời bài hát để tạo hợp âm chuẩn xác trong vài giây.
            </p>

            <div className="relative">
                {/* Sửa: textarea phải dùng bg-main-bg để nổi bật trên bg-card-inner */}
                <textarea
                    placeholder="Dán lời bài hát vào đây..."
                    className="w-full h-32 bg-main-bg border border-border-subtle rounded-sm p-4 text-sm text-main-fg focus:outline-none focus:border-primary/50 transition-all resize-none placeholder:opacity-30"
                />
                <div className="absolute bottom-3 right-3">
                    {/* Sửa: Nút bấm dùng bg-main-fg (đen ở light, trắng ở dark) */}
                    <ButtonCustom
                        name="Công cụ AI"
                        icon={faMagicWandSparkles}
                        variant="secondary"
                    />
                </div>
            </div>
        </section>
    );
};
