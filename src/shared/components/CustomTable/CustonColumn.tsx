import type React from "react";
import type { FC } from "react";

export interface CustomColumnProps {
    children: React.ReactNode;
    className?: string;
}

export const CustomColumn: FC<CustomColumnProps> = ({
    className,
    children
}) => {
    return (
        <td className={`px-6 py-4 ${className}`}>
            {children}
        </td>
    );
}