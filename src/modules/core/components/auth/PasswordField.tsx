import { useState } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Eye, EyeOff, Check } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'

interface PasswordFieldProps {
  id: string
  label: string
  placeholder?: string
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  disabled?: boolean
  showRequirements?: boolean
  value?: string
}

const requirements = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (v: string) => v.length >= 8 },
]

export function PasswordField({
  id,
  label,
  placeholder = '••••••••',
  register,
  errors,
  disabled,
  showRequirements = false,
  value = '',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const fieldError = errors[id] as { message?: string } | undefined

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="ml-1 font-medium text-zinc-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'auth-input h-12 rounded-[10px] border-zinc-200 bg-white px-5 pr-12 transition-all',
            fieldError && 'border-destructive ring-destructive',
          )}
          {...register(id)}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {fieldError?.message && (
        <p className="ml-1 text-xs font-medium text-destructive">{fieldError.message}</p>
      )}
      {showRequirements && (
        <ul className="space-y-1 pt-0.5">
          {requirements.map((req) => {
            const ok = req.test(value)
            return (
              <li
                key={req.id}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-colors',
                  ok ? 'text-emerald-600' : 'text-zinc-400',
                )}
              >
                <Check className={cn('h-3.5 w-3.5', ok ? 'opacity-100' : 'opacity-40')} />
                {req.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
