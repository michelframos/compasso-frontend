import type React from "react";
import type { FC } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export interface CustomModalGlobalProps {
    open?: boolean;
    close: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void;
    onConfirm: () => void;
    firsChunkTitle: string;
    secondChunkTitle?: string;
    colorSecondChunkTitle?: string;
    titleDescription?: string;
    children?: React.ReactNode;
    isLoading: boolean;
    showCancelButton?: boolean;
    textCancelButton?: string;
    showConfirmButton?: boolean;
    textConfirmButton?: string;
    colorConfirmButton?: string;
    loadingText?: string;
}

export const CustomModalGlobal: FC<CustomModalGlobalProps> = ({
    open = false,
    close,
    onClose,
    onConfirm,
    firsChunkTitle,
    secondChunkTitle,
    colorSecondChunkTitle,
    titleDescription,
    children,
    isLoading = false,
    showCancelButton = true,
    textCancelButton = 'Cancelar',
    showConfirmButton = true,
    textConfirmButton = 'Salvar',
    colorConfirmButton = 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95',
    loadingText = 'Salvando...'
}) => {
    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] flex flex-col max-h-[90vh] overflow-hidden p-0 border-none shadow-2xl">
                <DialogHeader className="bg-indigo-50/50 border-b border-indigo-100 shrink-0 p-8 pb-4">
                    <DialogTitle className="text-2xl font-bold text-zinc-900">
                        {firsChunkTitle} <span className={colorSecondChunkTitle}>{secondChunkTitle}</span>
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        {titleDescription}
                    </DialogDescription>
                </DialogHeader>
                {children}
                <DialogFooter className="bg-indigo-50/50 border-t border-indigo-100 shrink-0 p-8 pt-4">
                    {showCancelButton && (
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100"
                        >
                            {textCancelButton}
                        </Button>
                    )}

                    {showConfirmButton && (
                        <Button
                            type="button"
                            disabled={isLoading}
                            onClick={onConfirm}
                            className={colorConfirmButton}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {loadingText}
                                </>
                            ) : (
                                textConfirmButton
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}