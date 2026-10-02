import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

export interface CustomInputProps {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    register: any;
    errors: any;
    disabled?: boolean;
}

export const CustomInput = ({ id, label, type, placeholder, register, errors, disabled }: CustomInputProps) => {
    return (
        <div>
            <Label htmlFor={id} className="text-zinc-700 font-medium ml-1">{label}</Label>
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                className={`h-12 px-5 rounded-[10px] border-zinc-200 bg-white focus-visible:ring-indigo-600 transition-all ${errors[id] ? 'border-destructive ring-destructive' : ''}`}
                {...register(id)}
                disabled={disabled}
            />
            {errors[id] && (
                <p className="text-xs text-destructive font-medium ml-4">{errors[id].message}</p>
            )}
        </div>
    );
}