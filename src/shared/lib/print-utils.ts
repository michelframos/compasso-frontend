/**
 * Utilitário para impressão de contratos
 * Abre uma nova aba com o conteúdo HTML e aciona a impressão do sistema.
 */

import api from '@/shared/lib/axios';
import { formatCnpj } from '@/shared/lib/utils';
import { useAuthStore } from '@/shared/store/useAuthStore';
import type { ConfiguracaoEmpresa } from '@/modules/core/types';

interface DadosEscola {
  nome: string;
  razaoSocial: string | null;
  cnpj: string | null;
  endereco: string | null;
}

let dadosEscolaCache: { slug: string; dados: DadosEscola } | null = null;

export const limparCacheDadosEscola = () => {
  dadosEscolaCache = null;
};

const escapeHtml = (valor: string) =>
  valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatarCep = (cep: string) => {
  const digitos = cep.replace(/\D/g, '');
  return digitos.length === 8 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : cep;
};

const montarEndereco = (config: ConfiguracaoEmpresa): string | null => {
  const logradouro = [config.rua, config.numero].filter(Boolean).join(', ');
  const cidadeUf = [config.cidade?.nome, config.estado?.sigla].filter(Boolean).join('/');

  const partes = [
    logradouro,
    config.complemento,
    config.bairro,
    cidadeUf,
    config.cep ? `CEP ${formatarCep(config.cep)}` : null,
  ].filter((parte): parte is string => !!parte && parte.trim() !== '');

  return partes.length > 0 ? partes.join(' - ') : null;
};

const obterDadosEscola = async (): Promise<DadosEscola> => {
  const tenant = useAuthStore.getState().tenant;
  const slug = tenant?.slug ?? '';

  if (dadosEscolaCache && dadosEscolaCache.slug === slug) {
    return dadosEscolaCache.dados;
  }

  const dadosDaSessao: DadosEscola = {
    nome: tenant?.nome_fantasia || 'Escola',
    razaoSocial: tenant?.razao_social ?? null,
    cnpj: null,
    endereco: null,
  };

  try {
    const { data } = await api.get<ConfiguracaoEmpresa | null>('/configuracao-empresa');
    if (!data) return dadosDaSessao;

    const dados: DadosEscola = {
      nome: data.nome_fantasia || dadosDaSessao.nome,
      razaoSocial: data.razao_social || dadosDaSessao.razaoSocial,
      cnpj: data.cnpj ? formatCnpj(data.cnpj) : null,
      endereco: montarEndereco(data),
    };
    dadosEscolaCache = { slug, dados };
    return dados;
  } catch {
    // Usuários sem acesso às configurações (ex.: professor) imprimem com os dados da sessão.
    return dadosDaSessao;
  }
};

const montarCabecalho = (escola: DadosEscola, title: string) => {
  const identificacao = [
    escola.razaoSocial && escola.razaoSocial !== escola.nome ? escapeHtml(escola.razaoSocial) : null,
    escola.cnpj ? `CNPJ: ${escapeHtml(escola.cnpj)}` : null,
  ].filter(Boolean).join(' &bull; ');

  return `
    <div class="header">
      <h1>${escapeHtml(escola.nome)}</h1>
      ${identificacao ? `<p class="escola-info">${identificacao}</p>` : ''}
      ${escola.endereco ? `<p class="escola-info">${escapeHtml(escola.endereco)}</p>` : ''}
      <p class="documento-titulo">${escapeHtml(title)}</p>
    </div>
  `;
};

export const printContract = async (content: string, title: string = 'Contrato') => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Por favor, permita pop-ups para imprimir o contrato.');
    return;
  }

  printWindow.document.write('<p style="font-family: sans-serif; padding: 40px; color: #71717a;">Preparando contrato...</p>');
  printWindow.document.close();

  const escola = await obterDadosEscola();

  if (printWindow.closed) return;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${escapeHtml(title)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #18181b;
          margin: 0;
          padding: 40px;
          background-color: white;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #e4e4e7;
          padding-bottom: 20px;
        }

        .header h1 {
          margin: 0;
          font-size: 24px;
          color: #4f46e5;
        }

        .header .escola-info {
          margin: 4px 0 0;
          font-size: 12px;
          color: #52525b;
        }

        .header .documento-titulo {
          margin: 16px 0 0;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .content {
          font-size: 14px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .content > :first-child {
          margin-top: 0;
        }

        /* Estilos específicos para impressão */
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
          @page {
            margin: 2cm;
          }
        }

        /* Estilização básica para tabelas dentro do contrato se houver */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #e4e4e7;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f8fafc;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${montarCabecalho(escola, title)}
        <div class="content">${content.trim()}</div>
        <div class="no-print" style="text-align: center; margin-top: 40px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
            Imprimir Novamente
          </button>
        </div>
      </div>
      <script>
        setTimeout(() => {
          window.print();
        }, 500);
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
