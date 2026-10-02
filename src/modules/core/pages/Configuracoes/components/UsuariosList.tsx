import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, Trash2, Edit, Search, Shield } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useUsuarios } from '../hooks/useUsuarios';
import type { Usuario } from '@/modules/core/store/useUsuariosStore';
import { UsuarioFormModal } from './UsuarioFormModal';
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';
import { Badge } from '@/shared/components/ui/badge';
import { PaginationCustom } from '@/shared/components/ui/pagination-custom';

export const UsuariosList: React.FC = () => {
    const { usuarios, isLoading, currentPage, lastPage, fetchUsuarios, addUsuario, updateUsuario, removeUsuario } = useUsuarios();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<Usuario | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (debouncedSearch !== searchTerm) {
                setDebouncedSearch(searchTerm);
                setPage(1); // Reset page on new search
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, debouncedSearch]);

    useEffect(() => {
        fetchUsuarios(page, debouncedSearch, ['admin', 'secretaria']);
    }, [fetchUsuarios, page, debouncedSearch]);

    const handleOpenCreate = () => {
        setEditingUsuario(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (usuario: Usuario) => {
        setEditingUsuario(usuario);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        if (editingUsuario) {
            return await updateUsuario(editingUsuario.id, data);
        } else {
            return await addUsuario(data);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingId) return;
        const success = await removeUsuario(deletingId);
        if (success) {
            setDeletingId(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Admin</Badge>;
            case 'secretaria':
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Secretaria</Badge>;
            case 'professor':
                return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Professor</Badge>;
            case 'aluno':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Aluno</Badge>;
            case 'responsavel':
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">Responsável</Badge>;
            default:
                return <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase">{role}</Badge>;
        }
    };

    // O Backend já retorna os usuários páginados e filtrados pela busca
    const filteredUsuarios = usuarios;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 pb-6">
                <div>
                    <h2 className="text-lg font-bold text-zinc-900">Gerenciar Usuários</h2>
                    <p className="text-sm text-zinc-500">Contas com acesso ao sistema</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            placeholder="Buscar usuário..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9 rounded-full bg-zinc-50 border-transparent focus:bg-white focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full"
                        />
                    </div>
                    <Button
                        onClick={handleOpenCreate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-sm font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Usuário
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading && usuarios.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredUsuarios.length === 0 ? (
                    <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="p-4 bg-white rounded-full text-zinc-400 mb-4 shadow-sm border border-zinc-100">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900">Nenhum usuário encontrado</h3>
                            <p className="text-zinc-500 max-w-xs mx-auto mt-1">
                                Tente buscar com outro termo ou crie um novo.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden border-none shadow-sm bg-white rounded-[24px]">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Usuário</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Contato</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Acesso</th>
                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {filteredUsuarios.map((usuario) => (
                                            <tr key={usuario.id} className="hover:bg-zinc-50/50 transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold border border-zinc-200">
                                                            {usuario.nome.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-900 leading-none">{usuario.nome}</p>
                                                            <p className="text-[11px] text-zinc-500 mt-1">CPF: {usuario.cpf}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {usuario.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="w-4 h-4 text-zinc-400" />
                                                        {getRoleBadge(usuario.role)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                                                            onClick={() => handleOpenEdit(usuario)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
                                                            onClick={() => setDeletingId(usuario.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {lastPage > 1 && (
                    <PaginationCustom
                        currentPage={currentPage}
                        lastPage={lastPage}
                        onPageChange={(p) => setPage(p)}
                        isLoading={isLoading}
                    />
                )}
            </div>

            <UsuarioFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                usuario={editingUsuario}
                isLoading={isLoading}
            />

            <ConfirmDeleteDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                title={<>Excluir <span className="text-rose-500">Usuário</span></>}
                description="Esta ação não pode ser desfeita. Deseja realmente excluir este usuário?"
                confirmLabel="Excluir"
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};
