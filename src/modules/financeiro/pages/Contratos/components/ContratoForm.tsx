import React, { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Label } from '@/shared/components/ui/label';

import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from '@/shared/components/ui/select';

import { useContratos } from '../hooks/useContratos';

import type { Contrato } from '@/modules/financeiro/store/useContratoStore';

import { Tag, Loader2, User, FileText, GraduationCap, Users, Star, Guitar } from 'lucide-react';



interface ContratoFormProps {

  contrato?: Contrato;

  onClose: () => void;

  onSuccess: (id?: number) => void;

}



const PLACEHOLDER_GROUPS = [

  {

    label: 'Aluno',

    icon: <User className="w-3.5 h-3.5" />,

    placeholders: [

      { label: 'Nome Completo', value: '{{nome_aluno}}' },

      { label: 'CPF', value: '{{cpf_aluno}}' },

      { label: 'E-mail', value: '{{email_aluno}}' },

      { label: 'Telefone', value: '{{telefone_aluno}}' },

      { label: 'Data de Nascimento', value: '{{data_nascimento_aluno}}' },

      { label: 'Endereço Completo', value: '{{endereco_aluno}}' },

      { label: 'Nome do Responsável', value: '{{nome_responsavel}}' },

      { label: 'CPF do Responsável', value: '{{cpf_responsavel}}' },

    ],

  },

  {

    label: 'Matrícula',

    icon: <FileText className="w-3.5 h-3.5" />,

    placeholders: [

      { label: 'Data da Matrícula', value: '{{data_matricula}}' },

      { label: 'Valor da Mensalidade', value: '{{valor_mensalidade}}' },

    ],

  },

  {

    label: 'Turma',

    icon: <Users className="w-3.5 h-3.5" />,

    placeholders: [

      { label: 'Nome da Turma', value: '{{nome_turma}}' },

      { label: 'Descrição da Turma', value: '{{descricao_turma}}' },

      { label: 'Horários das Aulas', value: '{{horarios_turma}}' },

      { label: 'Professor(a)', value: '{{nome_professor}}' },

    ],

  },

  {

    label: 'Curso',

    icon: <GraduationCap className="w-3.5 h-3.5" />,

    placeholders: [

      { label: 'Nome do Curso', value: '{{nome_curso}}' },

      { label: 'Nome do Nível', value: '{{nome_nivel}}' },

    ],

  },

  {

    label: 'Instrumento',

    icon: <Guitar className="w-3.5 h-3.5" />,

    placeholders: [

      { label: 'Instrumento', value: '{{instrumento}}' },

      { label: 'Marca/Modelo', value: '{{marca_modelo_instrumento}}' },

      { label: 'Número de Série', value: '{{serie_instrumento}}' },

      { label: 'Data de Empréstimo', value: '{{data_emprestimo}}' },

    ],

  },

  {

    label: 'Espetáculo',

    icon: <Star className="w-3.5 h-3.5" />,

    placeholders: [

      { label: 'Nome do Espetáculo', value: '{{nome_espetaculo}}' },

      { label: 'Data do Espetáculo', value: '{{data_espetaculo}}' },

      { label: 'Local do Espetáculo', value: '{{local_espetaculo}}' },

    ],

  },

];



export const ContratoForm: React.FC<ContratoFormProps> = ({ contrato, onClose, onSuccess }) => {

  const { addContrato, updateContrato, isLoading } = useContratos();

  const [nome, setNome] = useState(contrato?.nome || '');

  const [conteudo, setConteudo] = useState(contrato?.conteudo || '');

  const [selectKey, setSelectKey] = useState(0);



  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();



    const data = { nome, conteudo };

    if (contrato?.id) {

      const success = await updateContrato(contrato.id, data);

      if (success) {

        onSuccess(contrato.id);

      }

    } else {

      const newId = await addContrato(data);

      if (newId) {

        onSuccess(newId);

      }

    }

  };



  const handleSelect = (value: string) => {

    insertPlaceholder(value);

    setSelectKey(prev => prev + 1);

  };



  const insertPlaceholder = (placeholder: string) => {

    // Acessar a instância do editor via window (exposta no componente RichTextEditor)

    const editor = (window as unknown as { tiptapEditor: any }).tiptapEditor;

    if (editor) {

      editor.chain().focus().insertContent(placeholder).run();

    }

  };



  return (

    <form onSubmit={handleSubmit} className="flex flex-col flex-1">

      <div className="p-8 space-y-6 flex-1">

        <div className="space-y-2">

          <Label htmlFor="nome" className="font-medium ml-1 text-zinc-700">Título do Contrato</Label>

          <Input

            id="nome"

            placeholder="Ex: Contrato de Matrícula 2024"

            value={nome}

            onChange={(e) => setNome(e.target.value)}

            required

            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"

          />

        </div>



        <div className="space-y-4">

          <div className="flex items-center justify-between">

            <Label htmlFor="conteudo-contrato" className="font-medium ml-1 text-zinc-700">Conteúdo do Contrato</Label>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium bg-zinc-100 px-3 py-1 rounded-full uppercase tracking-wider">

              <Tag className="w-3 h-3" />

              Selecione abaixo para inserir marcações

            </div>

          </div>



          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl shadow-inner overflow-x-auto">

            {PLACEHOLDER_GROUPS.map((group) => (

              <div key={group.label} className="space-y-1.5 min-w-[120px]">

                <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight">

                  {group.icon}

                  {group.label}

                </div>

                <Select key={`${group.label}-${selectKey}`} onValueChange={handleSelect}>

                  <SelectTrigger className="h-9 rounded-lg border-zinc-200 bg-white text-zinc-600 font-medium text-xs hover:border-indigo-600 transition-all hover:cursor-pointer">

                    <SelectValue placeholder={`Selecionar...`} />

                  </SelectTrigger>

                  <SelectContent className="rounded-xl border-zinc-200 shadow-xl overflow-hidden min-w-[200px]">

                    {group.placeholders.map((ph) => (

                      <SelectItem

                        key={ph.value}

                        value={ph.value}

                        className="text-xs font-medium py-2.5 px-3 focus:bg-indigo-50 focus:text-indigo-700 hover:cursor-pointer transition-colors"

                      >

                        {ph.label}

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

            ))}

          </div>



          <RichTextEditor

            value={conteudo}

            onChange={setConteudo}

            placeholder="Escreva o texto do contrato aqui..."

          />

        </div>

      </div>



      {/* Footer - Fixo na Página conforme padrão premium */}

      <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end w-full gap-3 shrink-0 rounded-b-[24px]">

        <Button

          variant="ghost"

          type="button"

          onClick={onClose}

          disabled={isLoading}

          className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100"

        >

          Cancelar

        </Button>

        <Button

          type="submit"

          disabled={isLoading}

          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95"

        >

          {isLoading ? (

            <>

              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              Salvando...

            </>

          ) : (

            contrato ? 'Atualizar Contrato' : 'Salvar Contrato'

          )}

        </Button>

      </div>

    </form>

  );

};
