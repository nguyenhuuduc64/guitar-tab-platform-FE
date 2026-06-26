import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";

interface AlertDialogProps {
    buttonName: string | React.ReactNode;
    message: string;
    title?: string;
    onSubmit: () => void;
    variant?: "default" | "destructive" | "outline" | "ghost";
    className?: string;
}

export const AlertDialogDemo = ({
    buttonName,
    message,
    title = "Xác nhận hành động",
    onSubmit,
    variant = "default",
    className,
}: AlertDialogProps) => {
    // Xác định style cho button dựa trên variant
    const getButtonStyles = () => {
        const baseStyles = "bg-white border border-slate-200 shadow-sm";

        if (variant === "destructive") {
            return cn(baseStyles, "text-red-600 hover:bg-red-50 hover:text-red-700");
        }

        return cn(baseStyles, "text-slate-700 hover:bg-slate-100 hover:text-slate-900");
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer",
                        variant === "destructive"
                            ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 dark:hover:text-red-300"
                            : "text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100",
                        className
                    )}
                >
                    {buttonName}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{message}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onSubmit}
                        className={
                            variant === "destructive"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-indigo-600 hover:bg-indigo-700"
                        }
                    >
                        Đồng ý
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};