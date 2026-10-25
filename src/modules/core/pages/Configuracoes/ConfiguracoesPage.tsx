import React, { useEffect, useState } from 'react';
import { QrCode, Building2, Users, MessageCircle, Blocks, CalendarCog } from 'lucide-react';
import { ConfiguracaoPixForm } from './components/ConfiguracaoPixForm';
import { ConfiguracaoEmpresaForm } from './components/ConfiguracaoEmpresaForm';
import { ModulosEscolaTab } from './components/ModulosEscolaTab';
import { PermissoesProfessorTab } from './components/PermissoesProfessorTab';
import { UsuariosList } from './components/UsuariosList';
import { ConfiguracaoWhatsappTab } from '@/modules/notificacoes'
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import { useAuthStore } from '@/shared/store/useAuthStore'

export const ConfiguracoesPage: React.FC = () => {
    const hasFinanceiro = useHasModulo('financeiro');
    const isAdmin = useAuthStore((s) => s.user?.role === 'admin');
    const [activeTab, setActiveTab] = useState<'pix' | 'empresa' | 'usuarios' | 'whatsapp' | 'modulos' | 'professores'>('whatsapp');

    useEffect(() => {
        if (activeTab === 'pix' && !hasFinanceiro) {
            setActiveTab('whatsapp');
        }
    }, [activeTab, hasFinanceiro]);

    return (
        <div className="space-y-6 mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        <span className="text-indigo-600">Configurações</span> do Sistema
                    </h1>
                    <p className="text-zinc-500 text-[14px]">
                        Gerencie as configurações gerais da sua escola.
                    </p>
                </div>
            </div>

            {/* Abas Estilo Professor/Aluno */}
            <div className="flex flex-col bg-white rounded-[24px] shadow-sm border border-zinc-100 overflow-hidden">
                <div className="flex flex-col px-6 pt-4 pb-0 bg-zinc-50/30 shrink-0 border-b border-zinc-100">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('empresa')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'empresa'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Dados da Empresa
                        </button>
                        {hasFinanceiro && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('pix')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'pix'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <QrCode className="w-4 h-4" />
                            Configuração PIX
                        </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setActiveTab('usuarios')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'usuarios'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <Users className="w-4 h-4" />
                            Usuários
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('whatsapp')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'whatsapp'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                        </button>
                        {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('modulos')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'modulos'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <Blocks className="w-4 h-4" />
                            Módulos
                        </button>
                        )}
                        {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('professores')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'professores'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <CalendarCog className="w-4 h-4" />
                            Professores
                        </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col">
                    {activeTab === 'empresa' ? (
                        <ConfiguracaoEmpresaForm />
                    ) : activeTab === 'pix' && hasFinanceiro ? (
                        <ConfiguracaoPixForm />
                    ) : activeTab === 'whatsapp' ? (
                        <ConfiguracaoWhatsappTab />
                    ) : activeTab === 'modulos' && isAdmin ? (
                        <ModulosEscolaTab />
                    ) : activeTab === 'professores' && isAdmin ? (
                        <PermissoesProfessorTab />
                    ) : (
                        <UsuariosList />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfiguracoesPage;
