import type { FC } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export interface CustomLoadingButtonProps {
    isLoading: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    text: string;
    loadingText: string;
}

export const CustomLoadingButton: FC<CustomLoadingButtonProps> = ({
    isLoading,
    disabled,
    type,
    text,
    loadingText
}) => {
    return (
        <Button
            type={type}
            disabled={disabled}
            className="w-full h-12 rounded-[10px] bg-indigo-600 hover:bg-indigo-700 text-base font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {loadingText}
                </>
            ) : (
                text
            )}
        </Button>
    )
}