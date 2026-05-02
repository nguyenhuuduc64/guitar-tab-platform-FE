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
    variant?: "default" | "destructive" | "outline";
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
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                    variant={variant}
                    className={cn("cursor-pointer", className)}
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
                                : ""
                        }
                    >
                        Đồng ý
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
