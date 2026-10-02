import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PlanoForm } from './components/PlanoForm'
import { usePlanoForm } from './hooks/usePlanoForm'

export function PlanoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const planoId = id && !isNaN(Number(id)) ? Number(id) : undefined
  const isEdit = !!planoId

  const { form, isLoading, isSubmitting, onSubmit, modulosCatalog } = usePlanoForm(planoId, () => {
    navigate('/platform/planos')
  })

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
        <Button variant="ghost" size="icon" onClick={() => navigate('/platform/planos')} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {isEdit ? 'Editar' : 'Novo'} <span className="text-indigo-600">Plano</span>
          </h1>
          <p className="text-zinc-500 text-sm">Defina nome, preço e limites do plano de assinatura.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100">
        <PlanoForm
          form={form}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={() => navigate('/platform/planos')}
          modulosCatalog={modulosCatalog}
        />
      </div>
    </div>
  )
}

export default PlanoFormPage
