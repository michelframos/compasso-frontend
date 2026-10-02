import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Usuario } from '@/modules/core/store/useUsuariosStore';
import type { UsuarioSubmitResult } from '../hooks/useUsuarios';

const usuarioSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório').max(255),
    email: z.string().email('Email inválido').max(255),
    cpf: z.string().min(11, 'CPF inválido').max(14),
    role: z.enum(['admin', 'secretaria', 'professor', 'aluno', 'responsavel']),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
    telefone: z.string().max(20).nullable().or(z.literal('')),
    whatsapp: z.string().max(20).nullable().or(z.literal('')),
}).refine((data) => {
    // Se digitou senha, a confirmação deve ser igual
    if (data.password && data.password !== data.password_confirmation) {
        return false;
    }
    return true;
}, {
    message: "As senhas não coincidem",
    path: ["password_confirmation"],
});

type UsuarioFormValues = z.infer<typeof usuarioSchema>;

const FORM_FIELDS: (keyof UsuarioFormValues)[] = [
    'nome', 'email', 'cpf', 'role', 'password', 'password_confirmation', 'telefone', 'whatsapp',
];

interface UsuarioFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<UsuarioSubmitResult>;
    usuario?: Usuario;
    isLoading?: boolean;
}

export const UsuarioFormModal: React.FC<UsuarioFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    usuario,
    isLoading,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        watch,
        formState: { errors },
    } = useForm<UsuarioFormValues>({
        resolver: zodResolver(usuarioSchema),
        defaultValues: {
            nome: '',
            email: '',
            cpf: '',
            role: 'admin',
            password: '',
            password_confirmation: '',
            telefone: '',
            whatsapp: '',
        },
    });

    const [submitError, setSubmitError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setSubmitError(null);
        if (usuario) {
            reset({
                nome: usuario.nome,
                email: usuario.email,
                cpf: usuario.cpf,
                role: usuario.role as any,
                telefone: usuario.telefone || '',
                whatsapp: usuario.whatsapp || '',
                password: '',
                password_confirmation: '',
            });
        } else {
            reset({
                nome: '',
                email: '',
                cpf: '',
                role: 'admin',
                telefone: '',
                whatsapp: '',
                password: '',
                password_confirmation: '',
            });
        }
    }, [usuario, reset, isOpen]);

    const handleFormSubmit = async (data: UsuarioFormValues) => {
        // Remove password da requisição se não foi preenchida (edição)
        const payload = { ...data };
        if (!payload.password) {
            delete payload.password;
            delete payload.password_confirmation;
        }

        setSubmitError(null);
        const result = await onSubmit(payload);
        if (result.success) {
            onClose();
            return;
        }

        setSubmitError(result.message);
        Object.entries(result.errors ?? {}).forEach(([field, messages]) => {
            if ((FORM_FIELDS as string[]).includes(field)) {
                setError(field as keyof UsuarioFormValues, { type: 'server', message: messages[0] });
            }
        });
    };

    const roleValue = watch('role');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-zinc-900">
                        {usuario ? 'Editar' : 'Novo'} <span className="text-indigo-600">Usuário</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-8 space-y-4">
                        {submitError && (
                            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{submitError}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="nome">Nome *</Label>
                            <Input
                                id="nome"
                                {...register('nome')}
                                placeholder="Nome completo"
                                className={`h-11 rounded-xl ${errors.nome ? 'border-rose-500' : ''}`}
                            />
                            {errors.nome && <p className="text-xs text-rose-500">{errors.nome.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email')}
                                placeholder="email@exemplo.com"
                                className={`h-11 rounded-xl ${errors.email ? 'border-rose-500' : ''}`}
                            />
                            {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF *</Label>
                            <Input
                                id="cpf"
                                {...register('cpf')}
                                placeholder="000.000.000-00"
                                className={`h-11 rounded-xl ${errors.cpf ? 'border-rose-500' : ''}`}
                            />
                            {errors.cpf && <p className="text-xs text-rose-500">{errors.cpf.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Função (Role) *</Label>
                            <Select
                                value={roleValue}
                                onValueChange={(value: any) => setValue('role', value)}
                            >
                                <SelectTrigger className="h-11 rounded-xl border-zinc-200">
                                    <SelectValue placeholder="Selecione a função" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="secretaria">Secretaria</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-xs text-rose-500">{errors.role.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input
                                id="telefone"
                                {...register('telefone')}
                                placeholder="(00) 0000-0000"
                                className={`h-11 rounded-xl ${errors.telefone ? 'border-rose-500' : ''}`}
                            />
                            {errors.telefone && <p className="text-xs text-rose-500">{errors.telefone.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha {usuario ? '(opcional para manter)' : '*'}</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password')}
                                placeholder="******"
                                className={`h-11 rounded-xl ${errors.password ? 'border-rose-500' : ''}`}
                            />
                            {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirmar Senha</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                {...register('password_confirmation')}
                                placeholder="******"
                                className={`h-11 rounded-xl ${errors.password_confirmation ? 'border-rose-500' : ''}`}
                            />
                            {errors.password_confirmation && <p className="text-xs text-rose-500">{errors.password_confirmation.message}</p>}
                        </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 border-t border-zinc-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="rounded-full px-6 h-9 font-bold bg-zinc-50 hover:bg-zinc-100 hover:cursor-pointer"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-full px-8 h-9 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 hover:cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Usuário'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
