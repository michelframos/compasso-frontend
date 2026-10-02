import type { FC } from "react";
import { Button } from "../ui/button";

export interface CustomRoundedButtonProps {
    text: string;
    icon: React.ReactNode;
    onClick: () => void;
}

export const CustomRoundedButton: FC<CustomRoundedButtonProps> = ({ text, icon, onClick }) => {
    return (
        <Button
            onClick={onClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"
        >
            {icon}
            {text}
        </Button>
    );
}