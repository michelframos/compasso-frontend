import { Link } from 'react-router-dom'
import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  Guitar,
  Music,
  Ruler,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useHasModulo } from '@/shared/hooks/useHasModulo'

type Atalho = {
  to: string
  icon: LucideIcon
  titulo: string
  descricao: string
  modulo?: 'financeiro' | 'espetaculos' | 'instrumentos'
}

const ATALHOS: Atalho[] = [
  { to: '/aluno/agenda', icon: CalendarDays, titulo: 'Agenda', descricao: 'Aulas, ensaios e eventos.' },
  { to: '/aluno/frequencia', icon: ClipboardCheck, titulo: 'Frequência', descricao: 'Presenças e faltas.' },
  { to: '/aluno/boletim', icon: BookOpen, titulo: 'Boletim', descricao: 'Notas e observações.' },
  { to: '/aluno/materiais', icon: FolderOpen, titulo: 'Materiais', descricao: 'Arquivos e links das turmas.' },
  { to: '/aluno/financeiro', icon: Wallet, titulo: 'Financeiro', descricao: 'Mensalidades e pagamentos.', modulo: 'financeiro' },
  { to: '/aluno/apresentacoes', icon: Music, titulo: 'Apresentações', descricao: 'Espetáculos e ensaios.', modulo: 'espetaculos' },
  { to: '/aluno/medidas', icon: Ruler, titulo: 'Medidas', descricao: 'Figurino e medidas corporais.', modulo: 'espetaculos' },
  { to: '/aluno/instrumentos', icon: Guitar, titulo: 'Instrumentos', descricao: 'Empréstimos ativos.', modulo: 'instrumentos' },
  { to: '/aluno/contratos', icon: FileText, titulo: 'Contratos', descricao: 'Documentos para aceite.' },
  { to: '/aluno/certificados', icon: Award, titulo: 'Certificados', descricao: 'Comprovantes emitidos.' },
  { to: '/aluno/matriculas', icon: GraduationCap, titulo: 'Matrículas', descricao: 'Turmas e cursos.' },
]

export function AtalhosAluno() {
  const financeiro = useHasModulo('financeiro')
  const espetaculos = useHasModulo('espetaculos')
  const instrumentos = useHasModulo('instrumentos')

  const liberados = ATALHOS.filter((atalho) => {
    if (!atalho.modulo) return true
    if (atalho.modulo === 'financeiro') return financeiro
    if (atalho.modulo === 'espetaculos') return espetaculos
    if (atalho.modulo === 'instrumentos') return instrumentos
    return true
  })

  return (
    <section className="space-y-3">
      <h2 className="text-[13px] font-black uppercase tracking-wider text-zinc-500">Atalhos</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {liberados.map(({ to, icon: Icon, titulo, descricao }) => (
          <Link
            key={to}
            to={to}
            className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-zinc-900">{titulo}</p>
              <p className="text-sm text-zinc-500">{descricao}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-indigo-500" />
          </Link>
        ))}
      </div>
    </section>
  )
}
