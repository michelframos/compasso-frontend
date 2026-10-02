import React from 'react';
import { Plus, Users, Mail, Phone, Trash2, Edit, Search, UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useLeads } from './hooks/useLeads';
import { LeadFormModal } from './components/LeadFormModal';
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';
import { PaginationCustom } from '@/shared/components/ui/pagination-custom';
import { PageHeader } from '@/shared/components/PageHeader';
import { CustomRoundedButton } from '@/shared/components/CustomRoudedButton';
import { NoData } from '@/shared/components/NoData';
import { CustomTable } from '@/shared/components/CustomTable';
import { CustomCircularLoading } from '@/shared/components/CustomCircularLoading';
import { CustomRow } from '@/shared/components/CustomTable/CustomRow';
import { CustomColumn } from '@/shared/components/CustomTable/CustonColumn';
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal';

export const LeadsPage: React.FC = () => {
    const {
        leads,
        pagination,
        isLoading,
        fetchLeads,
        searchTerm,
        setSearchTerm,
        isModalOpen,
        setIsModalOpen,
        editingLead,
        deletingId,
        setDeletingId,
        handleOpenCreate,
        handleOpenEdit,
        handleConvert,
        handleFormSubmit,
        handleDeleteConfirm,
        getStatusBadge,
        filteredLeads,
        form,
        handleManualSubmit
    } = useLeads();

    return (
        <div className="space-y-6">
            <PageHeader
                firstChunkText="Gestão de"
                secondChunkText="Leads"
                description="Potenciais alunos e interessados capturados."
                onClick={handleOpenCreate}
                textAddButton='Novo Lead'
                searchPlaceholder='Buscar por nome, email...'
                search={setSearchTerm}
                searchTerm={searchTerm}
            />

            {/* Listagem */}
            <div className="grid grid-cols-1 gap-4">
                {isLoading && leads.length === 0 ? (
                    <CustomCircularLoading />
                ) : filteredLeads.length === 0 ? (
                    <>
                        <NoData
                            title="Nenhum lead encontrado"
                            description="Novos interessados aparecerão aqui quando preencherem o formulário de captura ou forem cadastrados manualmente."
                            icon={<Users className="w-8 h-8" />}
                            showAddButton={true}
                            onClick={handleOpenCreate}
                            buttonText="Cadastrar primeiro lead"
                            iconButton={<Plus className="w-4 h-4" />}
                        />
                    </>
                ) : (
                    <CustomTable
                        columns={[
                            {
                                field: 'nome',
                                title: 'Interessado',
                            },
                            {
                                field: 'email',
                                title: 'Contato',
                            },
                            {
                                field: 'status',
                                title: 'Status',
                            },
                            {
                                field: 'acoes',
                                title: 'Ações',
                            },
                        ]}
                        rows={filteredLeads.map(lead => ({
                            renderField: (
                                <CustomRow key={lead.id}>
                                    <CustomColumn>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                                {lead.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900 leading-none">{lead.nome}</p>
                                                <p className="text-[11px] text-zinc-500 mt-1">Capturado em: {new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </div>
                                    </CustomColumn>
                                    <CustomColumn>
                                        <div className="space-y-1">
                                            {lead.email && (
                                                <div className="flex items-center gap-2 text-xs text-zinc-600">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {lead.email}
                                                </div>
                                            )}
                                            {lead.telefone && (
                                                <div className="flex items-center gap-2 text-xs text-zinc-600">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {lead.telefone}
                                                </div>
                                            )}
                                        </div>
                                    </CustomColumn>
                                    <CustomColumn>
                                        {getStatusBadge(lead.status)}
                                    </CustomColumn>
                                    <CustomColumn>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                                                onClick={() => handleOpenEdit(lead)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            {lead.status !== 'matriculado' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 hover:cursor-pointer"
                                                    onClick={() => handleConvert(lead)}
                                                    title="Converter em Aluno"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
                                                onClick={() => setDeletingId(lead.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CustomColumn>
                                </CustomRow>
                            )
                        }))}
                        mobileCards={filteredLeads.map((lead) => ({
                            header: (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">
                                            {lead.nome.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[15px] font-bold text-zinc-900 truncate">{lead.nome}</h3>
                                            <p className="text-[10px] text-zinc-500 font-medium">Capturado em: {new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(lead.status)}
                                </div>
                            ),
                            content: [
                                ...(lead.email ? [{
                                    icon: <Mail className="w-3.5 h-3.5" />,
                                    label: lead.email
                                }] : []),
                                ...(lead.telefone ? [{
                                    icon: <Phone className="w-3.5 h-3.5" />,
                                    label: lead.telefone
                                }] : [])
                            ],
                            buttons: (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 rounded-full border-zinc-200 text-xs font-bold px-4 gap-2 flex-1"
                                        onClick={() => handleOpenEdit(lead)}
                                    >
                                        <Edit className="w-4 h-4 text-indigo-600" />
                                        Editar Lead
                                    </Button>
                                    {lead.status !== 'matriculado' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 rounded-full border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold px-4 gap-2 flex-1"
                                            onClick={() => handleConvert(lead)}
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            Converter
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50"
                                        onClick={() => setDeletingId(lead.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </>
                            )
                        }))}
                    />
                )}

                {pagination && pagination.last_page > 1 && (
                    <PaginationCustom
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        onPageChange={(page) => fetchLeads(page)}
                        isLoading={isLoading}
                    />
                )}
            </div>

            {/* Modal de Formulário */}
            <CustomModalGlobal
                open={isModalOpen}
                close={setIsModalOpen}
                onClose={() => setIsModalOpen(false)}
                firsChunkTitle={editingLead ? 'Editar' : 'Novo'}
                secondChunkTitle="Lead"
                titleDescription={editingLead ? 'Edite os dados abaixo para atualizar o lead.' : 'Preencha os dados abaixo para cadastrar um novo lead.'}
                showCancelButton={true}
                showConfirmButton={true}
                textConfirmButton={editingLead ? 'Atualizar Lead' : 'Salvar Lead'}
                textCancelButton="Cancelar"
                isLoading={isLoading}
                onConfirm={handleManualSubmit}
            >
                <LeadFormModal form={form} />
            </CustomModalGlobal>


            <ConfirmDeleteDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                title={<>Excluir <span className="text-rose-500">Lead</span></>}
                description="Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita."
                confirmLabel="Excluir Lead"
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

export default LeadsPage;
