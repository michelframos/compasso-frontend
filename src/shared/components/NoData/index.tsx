import { Plus } from "lucide-react";
import { CustomRoundedButton } from "../CustomRoudedButton";
import { Card } from "../ui/card";

export interface NoDataProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    showAddButton?: boolean;
    onClick?: () => void;
    buttonText?: string;
    iconButton?: React.ReactNode;
}

export const NoData = ({
    title,
    description,
    icon,
    showAddButton = true,
    onClick,
    buttonText,
    iconButton
}: NoDataProps) => {
    return (
        <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-white rounded-full text-zinc-400 mb-4 shadow-sm border border-zinc-100">
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto mt-1">{description}</p>

                    <div className="mt-6">
                        {showAddButton && (
                            <CustomRoundedButton
                                text={buttonText || "Adicionar o primeiro"}
                                icon={iconButton || <Plus className="w-4 h-4" />}
                                onClick={onClick || (() => { })}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};