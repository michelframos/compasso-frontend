import React from 'react';

import { useEditor, EditorContent } from '@tiptap/react';

import { StarterKit } from '@tiptap/starter-kit';

import { Underline } from '@tiptap/extension-underline';

import { Placeholder } from '@tiptap/extension-placeholder';

import { Table } from '@tiptap/extension-table';

import { TableRow } from '@tiptap/extension-table-row';

import { TableCell } from '@tiptap/extension-table-cell';

import { TableHeader } from '@tiptap/extension-table-header';

import {

    Bold,

    Italic,

    Underline as UnderlineIcon,

    List,

    ListOrdered,

    Type,

    Table as TableIcon, Columns,

    Rows,

    Trash2

} from 'lucide-react';

import { Button } from './button';

import { cn } from '@/shared/lib/utils';



interface RichTextEditorProps {

  value: string;

  onChange: (value: string) => void;

  placeholder?: string;

}



const ToolbarButton = ({

  onClick,

  isActive,

  children,

  tooltip,

}: {

  onClick: () => void;

  isActive?: boolean;

  children: React.ReactNode;

  tooltip: string;

}) => (

  <Button

    type="button"

    variant="ghost"

    size="sm"

    onClick={onClick}

    className={cn(

      'h-8 w-8 p-0 rounded-md hover:bg-zinc-200 transition-colors',

      isActive && 'bg-zinc-200 text-indigo-600'

    )}

    title={tooltip}

  >

    {children}

  </Button>

);



export const RichTextEditor: React.FC<RichTextEditorProps> = ({

  value,

  onChange,

  placeholder = 'Escreva o conteúdo aqui...',

}) => {

  const editor = useEditor({

    extensions: [

      StarterKit,

      Underline,

      Placeholder.configure({

        placeholder,

      }),

      Table.configure({

        resizable: true,

      }),

      TableRow,

      TableHeader,

      TableCell,

    ],

    content: value,

    onUpdate: ({ editor }) => {

      onChange(editor.getHTML());

    },

    editorProps: {

      attributes: {

        class:

          'prose prose-sm max-w-none min-h-[400px] focus:outline-none p-6 text-zinc-700 leading-relaxed',

      },

    },

  });



  React.useEffect(() => {

    if (!editor) return;

    // Expor a instância do editor para o componente pai se necessário

    // Para este caso, vamos usar o DOM para manipulação direta de placeholders por simplicidade ou injetar via props

    const w = window as unknown as { tiptapEditor: typeof editor | null };

    w.tiptapEditor = editor;

    return () => {

      w.tiptapEditor = null;

    };

  }, [editor]);



  if (!editor) {

    return null;

  }



  return (

    <div className="w-full border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">

      {/* Toolbar */}

      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-100 bg-zinc-50/50">

        <ToolbarButton

          onClick={() => editor.chain().focus().toggleBold().run()}

          isActive={editor.isActive('bold')}

          tooltip="Negrito"

        >

          <Bold className="w-4 h-4" />

        </ToolbarButton>

        <ToolbarButton

          onClick={() => editor.chain().focus().toggleItalic().run()}

          isActive={editor.isActive('italic')}

          tooltip="Itálico"

        >

          <Italic className="w-4 h-4" />

        </ToolbarButton>

        <ToolbarButton

          onClick={() => editor.chain().focus().toggleUnderline().run()}

          isActive={editor.isActive('underline')}

          tooltip="Sublinhado"

        >

          <UnderlineIcon className="w-4 h-4" />

        </ToolbarButton>



        <div className="w-px h-4 bg-zinc-200 mx-1" />



        <ToolbarButton

          onClick={() => editor.chain().focus().toggleBulletList().run()}

          isActive={editor.isActive('bulletList')}

          tooltip="Lista de Marcadores"

        >

          <List className="w-4 h-4" />

        </ToolbarButton>

        <ToolbarButton

          onClick={() => editor.chain().focus().toggleOrderedList().run()}

          isActive={editor.isActive('orderedList')}

          tooltip="Lista Numerada"

        >

          <ListOrdered className="w-4 h-4" />

        </ToolbarButton>



        <div className="w-px h-4 bg-zinc-200 mx-1" />



        {/* Table Actions */}

        <ToolbarButton

          onClick={() =>

            editor

              .chain()

              .focus()

              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })

              .run()

          }

          tooltip="Inserir Tabela"

        >

          <TableIcon className="w-4 h-4" />

        </ToolbarButton>

        

        {editor.isActive('table') && (

          <>

            <ToolbarButton

              onClick={() => editor.chain().focus().addColumnBefore().run()}

              tooltip="Adicionar Coluna Antes"

            >

              <Columns className="w-4 h-4 rotate-180" />

            </ToolbarButton>

            <ToolbarButton

              onClick={() => editor.chain().focus().addColumnAfter().run()}

              tooltip="Adicionar Coluna Depois"

            >

              <Columns className="w-4 h-4" />

            </ToolbarButton>

            <ToolbarButton

              onClick={() => editor.chain().focus().addRowBefore().run()}

              tooltip="Adicionar Linha Antes"

            >

              <Rows className="w-4 h-4 rotate-180" />

            </ToolbarButton>

            <ToolbarButton

              onClick={() => editor.chain().focus().addRowAfter().run()}

              tooltip="Adicionar Linha Depois"

            >

              <Rows className="w-4 h-4" />

            </ToolbarButton>

            <ToolbarButton

              onClick={() => editor.chain().focus().deleteTable().run()}

              tooltip="Excluir Tabela"

            >

              <Trash2 className="w-4 h-4 text-red-500" />

            </ToolbarButton>

          </>

        )}



        <div className="ml-auto">

          <ToolbarButton

            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}

            tooltip="Limpar Formatação"

          >

            <Type className="w-4 h-4" />

          </ToolbarButton>

        </div>

      </div>



      <EditorContent editor={editor} />

      

      <style dangerouslySetInnerHTML={{ __html: `

        .tiptap table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; overflow: hidden; }

        .tiptap table td, .tiptap table th { min-width: 1em; border: 2px solid #ced4da; padding: 3px 5px; vertical-align: top; box-sizing: border-box; position: relative; }

        .tiptap table th { font-weight: bold; text-align: left; background-color: #f8f9fa; }

        .tiptap table .selectedCell:after { z-index: 2; position: absolute; content: ""; left: 0; right: 0; top: 0; bottom: 0; background: rgba(200, 200, 255, 0.4); pointer-events: none; }

        .tiptap table .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: -2px; width: 4px; background-color: #adf; pointer-events: none; }

        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #adb5bd; pointer-events: none; height: 0; }

      `}} />

    </div>

  );

};
