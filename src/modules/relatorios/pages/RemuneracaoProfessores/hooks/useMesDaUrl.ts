import { addMonths, format, isAfter, isValid, parse, startOfMonth } from 'date-fns'
import { useSearchParams } from 'react-router-dom'

/** Mês selecionado em `?mes=yyyy-MM`, para manter a competência ao navegar entre lista e extrato. */
export const useMesDaUrl = () => {
  const [params, setParams] = useSearchParams()
  const atual = startOfMonth(new Date())
  const lido = params.get('mes') ? parse(params.get('mes') as string, 'yyyy-MM', new Date()) : atual
  const mes = isValid(lido) && !isAfter(lido, atual) ? startOfMonth(lido) : atual

  const mudarMes = (delta: number) => {
    setParams({ mes: format(addMonths(mes, delta), 'yyyy-MM') }, { replace: true })
  }

  return { mes, competencia: format(mes, 'yyyy-MM'), podeAvancar: isAfter(atual, mes), mudarMes }
}
