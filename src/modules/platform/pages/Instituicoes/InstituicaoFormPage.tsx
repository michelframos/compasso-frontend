import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { InstituicaoForm } from './components/InstituicaoForm'
import { useInstituicaoForm } from './hooks/useInstituicaoForm'

export function InstituicaoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const instituicaoId = id && !isNaN(Number(id)) ? Number(id) : undefined
  const isEdit = !!instituicaoId

  const { form, isLoading, isSubmitting, onSubmit, defaultTrialDays, planos, isCreate } = useInstituicaoForm(
    instituicaoId,
    () => navigate('/platform/instituicoes'),
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/platform/instituicoes')} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {isEdit ? 'Editar' : 'Nova'} <span className="text-indigo-600">Escola</span>
          </h1>
          <p className="text-zinc-500 text-sm">Dados cadastrais, plano e período de trial.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100">
        <InstituicaoForm
          form={form}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={() => navigate('/platform/instituicoes')}
          defaultTrialDays={defaultTrialDays}
          planos={planos}
          isCreate={isCreate}
        />
      </div>
    </div>
  )
}

export default InstituicaoFormPage
