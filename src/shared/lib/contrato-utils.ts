export const placeholders = {
  // Aluno
  nome_aluno: '{{nome_aluno}}',
  cpf_aluno: '{{cpf_aluno}}',
  email_aluno: '{{email_aluno}}',
  telefone_aluno: '{{telefone_aluno}}',
  data_nascimento_aluno: '{{data_nascimento_aluno}}',
  endereco_aluno: '{{endereco_aluno}}',
  
  // Responsável
  nome_responsavel: '{{nome_responsavel}}',
  cpf_responsavel: '{{cpf_responsavel}}',
  
  // Matrícula / Turma / Curso
  nome_curso: '{{nome_curso}}',
  nome_nivel: '{{nome_nivel}}',
  nome_turma: '{{nome_turma}}',
  descricao_turma: '{{descricao_turma}}',
  data_matricula: '{{data_matricula}}',
  valor_mensalidade: '{{valor_mensalidade}}',
  nome_professor: '{{nome_professor}}',
  horarios_turma: '{{horarios_turma}}',
  
  // Instrumento
  instrumento: '{{instrumento}}',
  marca_modelo_instrumento: '{{marca_modelo_instrumento}}',
  serie_instrumento: '{{serie_instrumento}}',
  data_emprestimo: '{{data_emprestimo}}',
  
  // Espetáculo
  nome_espetaculo: '{{nome_espetaculo}}',
  data_espetaculo: '{{data_espetaculo}}',
  local_espetaculo: '{{local_espetaculo}}',
};

export type AlunoPayload = {
    usuario?: {
      nome?: string;
      email?: string;
      telefone?: string | null;
      cpf?: string | null;
      data_aniversario?: string | null;
      rua?: string | null;
      numero?: string | null;
      complemento?: string | null;
      cep?: string | null;
      id_cidade?: number | null;
    };
    id?: number;
    cpf?: string | null;
    data_nascimento?: string | null;
    endereco?: string | null;
    numero?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    uf?: string | null;
    cep?: string | null;
    responsaveis?: Array<{
      usuario?: {
        nome?: string;
        cpf?: string | null;
      };
    }>;
};

export type InstrumentoPayload = {
    nome?: string;
    tipo?: string;
    numero_serie?: string | null;
    data_emprestimo?: string | null;
};

interface ContratoData {
  aluno?: AlunoPayload;
  turma?: {
    id?: number;
    nome?: string;
    descricao?: string | null;
    valor_mensalidade?: number | null;
    curso?: { nome: string };
    nivel?: { nome: string };
    professor?: {
      usuario?: { nome: string };
    };
    horarios?: Array<{
      dia_semana: string | number;
      hora_inicio: string;
      hora_termino?: string;
      hora_fim?: string;
    }>;
  };
  curso?: {
    id?: number;
    nome?: string;
    descricao?: string | null;
  };
  instrumento?: InstrumentoPayload;
  espetaculo?: {
    nome?: string;
    titulo?: string;
    data?: string | null;
    data_evento?: string | null;
    local?: string | null;
  };
  data_matricula?: string;
  data_emprestimo?: string;
}

/**
 * Escapa caracteres para uso em Expressão Regular
 */
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const substituirPlaceholders = (conteudo: string, data: ContratoData): string => {
  if (!conteudo) return '';
  let resultado = conteudo;

  // Mapa de substituições
  const substituicoes: Record<string, string> = {};

  // Dados do Aluno
  if (data.aluno) {
    const u = data.aluno.usuario || {};
    substituicoes[placeholders.nome_aluno] = u.nome || '';
    substituicoes[placeholders.cpf_aluno] = data.aluno.cpf || u.cpf || '';
    substituicoes[placeholders.email_aluno] = u.email || '';
    substituicoes[placeholders.telefone_aluno] = u.telefone || '';
    substituicoes[placeholders.data_nascimento_aluno] = data.aluno.data_nascimento || u.data_aniversario || '';
    
    const enderecoCompleto = [
      data.aluno.endereco || u.rua,
      (data.aluno.numero || u.numero) ? `, ${data.aluno.numero || u.numero}` : '',
      (data.aluno.bairro || u.complemento) ? ` - ${data.aluno.bairro || u.complemento}` : '',
      (data.aluno.cidade) ? ` - ${data.aluno.cidade}${data.aluno.uf ? '/' + data.aluno.uf : ''}` : '',
      (data.aluno.cep || u.cep) ? ` (CEP: ${data.aluno.cep || u.cep})` : '',
    ].filter(Boolean).join('');
    
    substituicoes[placeholders.endereco_aluno] = enderecoCompleto;

    // Tentar pegar primeiro responsável se existir
    if (data.aluno.responsaveis && data.aluno.responsaveis.length > 0) {
        const resp = data.aluno.responsaveis[0];
        substituicoes[placeholders.nome_responsavel] = resp.usuario?.nome || '';
        substituicoes[placeholders.cpf_responsavel] = resp.usuario?.cpf || '';
    }
  }

  // Dados da Turma / Curso
  if (data.turma) {
    const cursoNome = data.turma.curso?.nome || '';
    const nivelNome = data.turma.nivel?.nome || '';
    
    substituicoes[placeholders.nome_curso] = cursoNome;
    substituicoes[placeholders.nome_nivel] = nivelNome;
    
    // Turma Nome: se não tiver nome explícito, combina Curso + Nível
    substituicoes[placeholders.nome_turma] = data.turma.nome || (cursoNome && nivelNome ? `${cursoNome} - ${nivelNome}` : (cursoNome || nivelNome || ''));
    
    substituicoes[placeholders.descricao_turma] = data.turma.descricao || '';
    substituicoes[placeholders.valor_mensalidade] = data.turma.valor_mensalidade 
      ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.turma.valor_mensalidade) 
      : '';
    substituicoes[placeholders.nome_professor] = data.turma.professor?.usuario?.nome || '';
    
    if (data.turma.horarios && Array.isArray(data.turma.horarios)) {
        substituicoes[placeholders.horarios_turma] = data.turma.horarios
            .map(h => {
                const dia = typeof h.dia_semana === 'number' 
                    ? ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][h.dia_semana] 
                    : h.dia_semana;
                const fim = h.hora_termino || h.hora_fim || '';
                return `${dia}: ${h.hora_inicio?.substring(0, 5)} - ${fim?.substring(0, 5)}`;
            })
            .join(', ');
    }
  }

  // Dados do Instrumento
  if (data.instrumento) {
      substituicoes[placeholders.instrumento] = data.instrumento.nome || '';
      substituicoes[placeholders.marca_modelo_instrumento] = data.instrumento.tipo || '';
      substituicoes[placeholders.serie_instrumento] = data.instrumento.numero_serie || '';
      
      const dEmprestimo = data.instrumento.data_emprestimo || data.data_emprestimo;
      if (dEmprestimo) {
          substituicoes[placeholders.data_emprestimo] = new Date(dEmprestimo).toLocaleDateString('pt-BR');
      }
  }

  // Dados do Espetáculo
  if (data.espetaculo) {
      substituicoes[placeholders.nome_espetaculo] = data.espetaculo.nome || data.espetaculo.titulo || '';
      const dEvento = data.espetaculo.data || data.espetaculo.data_evento;
      if (dEvento) {
          substituicoes[placeholders.data_espetaculo] = new Date(dEvento).toLocaleDateString('pt-BR');
      }
      substituicoes[placeholders.local_espetaculo] = data.espetaculo.local || '';
  }

  // Datas Genéricas
  if (data.data_matricula) {
    substituicoes[placeholders.data_matricula] = new Date(data.data_matricula).toLocaleDateString('pt-BR');
  }

  // Aplicar todas as substituições
  Object.keys(substituicoes).forEach(key => {
    const valor = substituicoes[key] || '';
    const regex = new RegExp(escapeRegExp(key), 'g');
    resultado = resultado.replace(regex, valor);
  });

  return resultado;
};
