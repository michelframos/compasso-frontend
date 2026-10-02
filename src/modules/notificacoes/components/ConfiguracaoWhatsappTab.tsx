import React, { useState, useEffect } from 'react';
import { MessageCircle, Save, Loader2, AlertTriangle, QrCode, Play } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { useWhatsappConfig } from '../hooks/useWhatsappConfig'
import { useNotificacoesConfig, type NotificacaoConfig } from '../hooks/useNotificacoesConfig'
import { useHasModulo } from '@/shared/hooks/useHasModulo'

export const ConfiguracaoWhatsappTab: React.FC = () => {
    const hasFinanceiro = useHasModulo('financeiro');
    const { status, qrCode, loading: loadingWhatsapp, connect, reconnect, disconnect } = useWhatsappConfig();
    const { configs, loading: loadingNotificacoes, saving, dispatching, saveConfigs, dispararAgora } = useNotificacoesConfig();
    const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
    const [isDispararDialogOpen, setIsDispararDialogOpen] = useState(false);
    const [localConfigs, setLocalConfigs] = useState<NotificacaoConfig[]>([]);

    useEffect(() => {
        setLocalConfigs(configs);
    }, [configs]);

    const handleSave = () => {
        const payload: NotificacaoConfig[] = localConfigs.map(c => ({
            modulo: c.modulo,
            tipo: c.tipo,
            ativo: c.ativo,
            dias_antecedencia: Number(c.dias_antecedencia),
            intervalo_repeticao: Number(c.intervalo_repeticao),
            max_repeticoes: c.max_repeticoes ? Number(c.max_repeticoes) : null,
            template_mensagem: c.template_mensagem || '',
            horario_envio: (c.horario_envio || '08:00').slice(0, 5),
        }));
        
        const defaultConfigs: NotificacaoConfig[] = [
            { modulo: 'agendamentos', tipo: null, ativo: false, dias_antecedencia: 1, intervalo_repeticao: 1, max_repeticoes: null, template_mensagem: '', horario_envio: '08:00' },
            { modulo: 'contas_a_receber', tipo: 'vencimento', ativo: false, dias_antecedencia: 5, intervalo_repeticao: 1, max_repeticoes: null, template_mensagem: '', horario_envio: '08:00' },
            { modulo: 'contas_a_receber', tipo: 'atraso', ativo: false, dias_antecedencia: 1, intervalo_repeticao: 1, max_repeticoes: null, template_mensagem: '', horario_envio: '08:00' }
        ];

        const finalConfigs = defaultConfigs.map(defaultConfig => {
            const existing = payload.find(p => p.modulo === defaultConfig.modulo && p.tipo === defaultConfig.tipo);
            if (existing) return existing;
            return defaultConfig;
        });

        saveConfigs(finalConfigs);
    };

    const updateConfig = (modulo: 'agendamentos' | 'contas_a_receber', tipo: 'vencimento' | 'atraso' | null, field: keyof NotificacaoConfig, value: any) => {
        const idx = localConfigs.findIndex(c => c.modulo === modulo && c.tipo === tipo);
        
        const newConfigs = [...localConfigs];
        if (idx >= 0) {
            newConfigs[idx] = { ...newConfigs[idx], [field]: value };
        } else {
            newConfigs.push({
                modulo, tipo, ativo: false, dias_antecedencia: 1, intervalo_repeticao: 1, max_repeticoes: null, template_mensagem: '', horario_envio: '08:00',
                [field]: value
            });
        }
        setLocalConfigs(newConfigs);
    };
    
    const getConfig = (modulo: 'agendamentos' | 'contas_a_receber', tipo: 'vencimento' | 'atraso' | null): NotificacaoConfig => {
        return localConfigs.find(c => c.modulo === modulo && c.tipo === tipo) || {
            modulo, tipo, ativo: false, dias_antecedencia: 1, intervalo_repeticao: 1, max_repeticoes: null, template_mensagem: '', horario_envio: '08:00'
        };
    };

    const agendamentosConfig = getConfig('agendamentos', null);
    const vencimentoConfig = getConfig('contas_a_receber', 'vencimento');
    const atrasoConfig = getConfig('contas_a_receber', 'atraso');

    if (loadingNotificacoes && localConfigs.length === 0) {
        return (
            <div className="flex items-center justify-center py-20 gap-2 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Carregando configurações...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="p-8 space-y-8">
                {/* Seção 1 - Conexão WhatsApp */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900">Conexão WhatsApp</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Gerencie a conexão da sua instância para disparos automáticos</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start rounded-xl border border-zinc-200 p-6 bg-zinc-50/50">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-zinc-700">Status atual:</span>
                                {status === 'connected' && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Conectado</span>}
                                {status === 'disconnected' && <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold">Desconectado</span>}
                                {status === 'pending' && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" />Aguardando leitura do QR Code</span>}
                                {status === 'unknown' && <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-bold flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/>Carregando...</span>}
                            </div>
                            
                            <p className="text-sm text-zinc-500">
                                {status === 'connected' && 'Seu WhatsApp está pronto para enviar notificações para seus alunos.'}
                                {status === 'disconnected' && 'Conecte seu WhatsApp lendo o QR Code para ativar o envio automático.'}
                                {status === 'pending' && 'Aguardando leitura do QR Code no aplicativo do WhatsApp em seu celular.'}
                            </p>

                            <div className="flex gap-3 pt-2">
                                {status === 'disconnected' && (
                                    <Button onClick={connect} disabled={loadingWhatsapp} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 hover:cursor-pointer">
                                        {loadingWhatsapp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <QrCode className="w-4 h-4 mr-2" />}
                                        Conectar
                                    </Button>
                                )}
                                
                                {status === 'pending' && !qrCode && (
                                     <Button disabled className="bg-emerald-600/50 text-white h-9">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Gerando QR Code...
                                     </Button>
                                )}

                                {(status === 'connected' || status === 'pending') && (
                                    <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" className="h-9 hover:cursor-pointer">
                                                Desconectar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Desconectar WhatsApp?</DialogTitle>
                                                <DialogDescription>
                                                    As notificações automáticas pararão de ser enviadas até você conectar novamente. Todos os disparos programados não serão entregues.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter className="mt-4">
                                                <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>Cancelar</Button>
                                                <Button variant="destructive" onClick={() => { disconnect(); setIsDisconnectDialogOpen(false); }}>
                                                    Sim, desconectar
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>

                        {qrCode && (
                            <div className="flex flex-col items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm shrink-0">
                                <p className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">Leia pelo APP</p>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48 rounded" />
                                <Button variant="link" size="sm" onClick={reconnect} disabled={loadingWhatsapp} className="mt-2 text-zinc-500 hover:text-zinc-800 text-xs">
                                    Gerar novo código
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Seção 2 - Configurações de Notificações */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900">Regras de Disparo Automático</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Defina quando e como as mensagens serão enviadas automaticamente via fila</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {/* Agendamentos */}
                        <div className={`p-6 rounded-xl border transition-all ${agendamentosConfig.ativo ? 'border-indigo-200 bg-white' : 'border-zinc-200 bg-zinc-50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-zinc-900">Agendamentos / Aulas</h3>
                                <Switch
                                    checked={agendamentosConfig.ativo}
                                    onCheckedChange={(val: boolean) => updateConfig('agendamentos', null, 'ativo', val)}
                                />
                            </div>
                            
                            <div className={`space-y-3 ${!agendamentosConfig.ativo && 'opacity-50 pointer-events-none'}`}>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Avisar com antecedência de (dias)</Label>
                                        <Input
                                            type="number" min="0" className="h-9"
                                            value={agendamentosConfig.dias_antecedencia}
                                            onChange={(e) => updateConfig('agendamentos', null, 'dias_antecedencia', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Máximo de re-envios (0=ilimitado)</Label>
                                        <Input
                                            type="number" min="0" className="h-9"
                                            value={agendamentosConfig.max_repeticoes ?? ''}
                                            onChange={(e) => updateConfig('agendamentos', null, 'max_repeticoes', e.target.value || null)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Re-enviar a cada (dias)</Label>
                                        <Input
                                            type="number" min="1" className="h-9"
                                            value={agendamentosConfig.intervalo_repeticao}
                                            onChange={(e) => updateConfig('agendamentos', null, 'intervalo_repeticao', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-600">Horário de Envio</Label>
                                        <Input
                                            type="time" className="h-9"
                                            value={agendamentosConfig.horario_envio || '08:00'}
                                            onChange={(e) => updateConfig('agendamentos', null, 'horario_envio', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-xs text-zinc-600">Template da Mensagem</Label>
                                        <span className="text-[10px] text-zinc-400">Variáveis: {'{nome}'}, {'{data}'}, {'{horario}'}, {'{curso}'}</span>
                                    </div>
                                    <Textarea
                                        className="resize-none h-24"
                                        placeholder="Olá {nome}! Lembramos do seu agendamento no curso {curso} para o dia {data} às {horario}..."
                                        value={agendamentosConfig.template_mensagem || ''}
                                        onChange={(e) => updateConfig('agendamentos', null, 'template_mensagem', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {hasFinanceiro && (
                        <div className="space-y-6">
                            {/* Contas a Receber (Vencimento) */}
                            <div className={`p-6 rounded-xl border transition-all ${vencimentoConfig.ativo ? 'border-amber-200 bg-white' : 'border-zinc-200 bg-zinc-50'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-zinc-900">Aviso de Vencimento</h3>
                                    <Switch
                                        checked={vencimentoConfig.ativo}
                                        onCheckedChange={(val: boolean) => updateConfig('contas_a_receber', 'vencimento', 'ativo', val)}
                                    />
                                </div>
                                
                                <div className={`space-y-3 ${!vencimentoConfig.ativo && 'opacity-50 pointer-events-none'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-600">Avisar com antecedência de (dias)</Label>
                                            <Input
                                                type="number" min="0" className="h-9"
                                                value={vencimentoConfig.dias_antecedencia}
                                                onChange={(e) => updateConfig('contas_a_receber', 'vencimento', 'dias_antecedencia', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-600">Re-enviar a cada (dias)</Label>
                                            <Input
                                                type="number" min="1" className="h-9"
                                                value={vencimentoConfig.intervalo_repeticao}
                                                onChange={(e) => updateConfig('contas_a_receber', 'vencimento', 'intervalo_repeticao', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-600">Horário de Envio</Label>
                                            <Input
                                                type="time" className="h-9"
                                                value={vencimentoConfig.horario_envio || '08:00'}
                                                onChange={(e) => updateConfig('contas_a_receber', 'vencimento', 'horario_envio', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs text-zinc-600">Template da Mensagem</Label>
                                            <span className="text-[10px] text-zinc-400">Variáveis: {'{nome}'}, {'{valor}'}, {'{vencimento}'}</span>
                                        </div>
                                        <Textarea
                                            className="resize-none h-24"
                                            placeholder="Olá {nome}. Sua mensalidade no valor de {valor} vence no dia {vencimento}."
                                            value={vencimentoConfig.template_mensagem || ''}
                                            onChange={(e) => updateConfig('contas_a_receber', 'vencimento', 'template_mensagem', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contas a Receber (Atraso) */}
                            <div className={`p-6 rounded-xl border transition-all ${atrasoConfig.ativo ? 'border-rose-200 bg-white' : 'border-zinc-200 bg-zinc-50'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-zinc-900">Aviso de Atraso</h3>
                                    <Switch
                                        checked={atrasoConfig.ativo}
                                        onCheckedChange={(val: boolean) => updateConfig('contas_a_receber', 'atraso', 'ativo', val)}
                                    />
                                </div>
                                
                                <div className={`space-y-3 ${!atrasoConfig.ativo && 'opacity-50 pointer-events-none'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-600">Re-enviar a cada (dias)</Label>
                                            <Input
                                                type="number" min="1" className="h-9"
                                                value={atrasoConfig.intervalo_repeticao}
                                                onChange={(e) => updateConfig('contas_a_receber', 'atraso', 'intervalo_repeticao', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-600">Máximo de re-envios</Label>
                                            <Input
                                                type="number" min="0" className="h-9"
                                                value={atrasoConfig.max_repeticoes ?? ''}
                                                onChange={(e) => updateConfig('contas_a_receber', 'atraso', 'max_repeticoes', e.target.value || null)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs text-zinc-600">Horário de Envio</Label>
                                            <Input
                                                type="time" className="h-9"
                                                value={atrasoConfig.horario_envio || '08:00'}
                                                onChange={(e) => updateConfig('contas_a_receber', 'atraso', 'horario_envio', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-xs text-zinc-600">Template da Mensagem</Label>
                                            <span className="text-[10px] text-zinc-400">Variáveis: {'{nome}'}, {'{valor}'}, {'{dias_atraso}'}</span>
                                        </div>
                                        <Textarea
                                            className="resize-none h-24"
                                            placeholder="Olá {nome}. Identificamos um atraso de {dias_atraso} dias na sua parcela de {valor}."
                                            value={atrasoConfig.template_mensagem || ''}
                                            onChange={(e) => updateConfig('contas_a_receber', 'atraso', 'template_mensagem', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex justify-between gap-3 shrink-0 rounded-b-[24px]">
                <Dialog open={isDispararDialogOpen} onOpenChange={setIsDispararDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            variant="outline" 
                            disabled={dispatching || status !== 'connected'}
                            className="bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100 h-9 font-medium transition-all hover:cursor-pointer group"
                        >
                            {dispatching ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
                            ) : (
                                <Play className="mr-2 h-4 w-4 text-emerald-600 group-hover:text-emerald-700" />
                            )}
                            Disparar Agora
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Disparar Notificações Manualmente</DialogTitle>
                            <DialogDescription>
                                Você está prestes a disparar todas as notificações pendentes agora, ignorando os horários agendados. Deseja continuar?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 border-t pt-4">
                            <Button variant="outline" onClick={() => setIsDispararDialogOpen(false)}>Cancelar</Button>
                            <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                                onClick={() => { dispararAgora(); setIsDispararDialogOpen(false); }}
                            >
                                Sim, enviar todas
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95"
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Configurações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};
