import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { SiteModuloForm } from './components/SiteModuloForm'
import { useSiteModuloForm } from './hooks/useSiteModuloForm'

export function SiteModuloFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const moduloId = id && !isNaN(Number(id)) ? Number(id) : undefined
  const isEdit = !!moduloId

  const { form, isLoading, isSubmitting, onSubmit } = useSiteModuloForm(moduloId, () => {
    navigate('/platform/modulos')
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/platform/modulos')} className="rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {isEdit ? 'Editar' : 'Novo'} <span className="text-indigo-600">Módulo</span>
          </h1>
          <p className="text-zinc-500 text-sm">
            Conteúdo da seção Funcionalidades. Só aparece no site após aprovação.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100">
        <SiteModuloForm
          form={form}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={() => navigate('/platform/modulos')}
        />
      </div>
    </div>
  )
}

export default SiteModuloFormPage
