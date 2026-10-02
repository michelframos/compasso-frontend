import React from "react";
import { Card, CardContent } from "../ui/card";

interface Columns {
    field?: string;
    title: string;
    icon?: React.FC<{ column: string }>;
    sortable?: boolean;
    onSort?: (field?: string) => void;
}

interface MobileCard {
    header: React.ReactNode;
    content: {
        icon?: React.ReactNode;
        label: string | null;
    }[];
    buttons: React.ReactNode;
}

export interface CustomTableProps<T> {
    columns: Columns[];
    rows: {
        renderField: React.ReactNode;
    }[];
    mobileCards: MobileCard[];
}

export const CustomTable = <T,>({ columns, rows, mobileCards }: CustomTableProps<T>) => {
    return (
        <Card className="overflow-hidden border-none shadow-sm bg-white">
            <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                {columns?.map((column, index) => (
                                    <th
                                        key={column.field || index}
                                        className={`px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-zinc-100/50 transition-colors' : ''}`}
                                        onClick={() => {
                                            if (column.sortable && column.onSort) {
                                                column.onSort(column.field);
                                            }
                                        }}
                                    >
                                        <div className={`flex items-center ${column.title === 'Ações' ? 'justify-end' : ''}`}>
                                            {column.title}
                                            {column.icon && column.field && <column.icon column={column.field} />}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-zinc-50">
                            {rows?.map((row, index) => (
                                <React.Fragment key={index}>
                                    {row.renderField}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-zinc-100">
                    {mobileCards?.map((card, index) => (
                        <div key={index} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">

                            <div className="mb-3">
                                {card.header}
                            </div>
                            <div className="grid grid-cols-1 gap-2.5 px-1">
                                {card.content.filter(item => item.label).map((item, i) => (
                                    <div key={i} className="flex items-center gap-2.5 text-[13px] text-zinc-600">
                                        {item.icon && (
                                            <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                                                {item.icon}
                                            </div>
                                        )}
                                        <span className="truncate">{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                                {card.buttons}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
