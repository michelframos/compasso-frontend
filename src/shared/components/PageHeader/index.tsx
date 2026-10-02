import { Plus, Search } from "lucide-react";
import type { FC } from "react";
import { CustomRoundedButton } from "../CustomRoudedButton";
import { Input } from "../ui/input";

export interface PageHeaderProps {
    firstChunkText: string;
    secondChunkText?: string;
    description: string;
    onClick: () => void;
    showSearch?: boolean;
    search: (term: string) => void;
    searchTerm: string;
    searchPlaceholder?: string;
    showAddButton?: boolean;
    textAddButton?: string;
    children?: React.ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({
    firstChunkText,
    secondChunkText,
    description,
    onClick,
    showSearch = true,
    search,
    searchTerm,
    searchPlaceholder,
    showAddButton = true,
    textAddButton = 'Novo',
    children
}) => {
    return (
        <div className="flex flex-col lg:flex-row md:items-center md:items-start md:justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                    {firstChunkText} <span className="text-indigo-600">{secondChunkText}</span>
                </h1>
                <p className="text-zinc-500 mt-1 text-[14px]">{description}</p>
            </div>

            <div className="flex flex-col lg:flex-row md:items-center gap-3 w-full lg:w-auto">
                {showSearch && (
                    <div className="relative w-full lg:w-auto flex-1 lg:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => search(e.target.value)}
                            className="pl-9 h-9 rounded-full bg-white border-zinc-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        />
                    </div>
                )}
                {children}
                {showAddButton && (
                    <CustomRoundedButton
                        text={textAddButton}
                        icon={<Plus className="w-4 h-4" />}
                        onClick={onClick}
                    />
                )}
            </div>
        </div>
    );
}