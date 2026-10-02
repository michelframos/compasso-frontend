import React, { type FC } from "react";

export interface CustomRowProps {
    key: any;
    children: React.ReactNode;
}

export const CustomRow: FC<CustomRowProps> = ({ key, children }) => {
    return (
        <tr key={key} className="hover:bg-zinc-50/50 transition-colors group">
            {children}
        </tr>
    );
}