import React from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

interface CampoPerfilProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string
  label: React.ReactNode
  registro: UseFormRegisterReturn
  erro?: FieldError
  className?: string
}

export const CampoPerfil: React.FC<CampoPerfilProps> = ({ id, label, registro, erro, className, ...inputProps }) => (
  <div className={`space-y-2 ${className ?? ''}`}>
    <Label htmlFor={id} className={`font-medium ml-1 flex items-center gap-2 ${erro ? 'text-rose-500' : 'text-zinc-700'}`}>
      {label}
    </Label>
    <Input
      id={id}
      className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${erro ? 'border-rose-500' : 'border-zinc-200'}`}
      {...inputProps}
      {...registro}
    />
    {erro && <p className="text-[11px] text-rose-500 ml-1">{erro.message}</p>}
  </div>
)
