import React from 'react';

import { NotebookText, Trash2, Edit } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { useCursos } from './hooks/useCursos';

import { CursoForm } from './components/CursoForm';

import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal';

import { CustomCircularLoading } from '@/shared/components/CustomCircularLoading';

import { NoData } from '@/shared/components/NoData';

import { CustomTable } from '@/shared/components/CustomTable';

import { PageHeader } from '@/shared/components/PageHeader';

import { CustomRow } from '@/shared/components/CustomTable/CustomRow';

import { CustomColumn } from '@/shared/components/CustomTable/CustonColumn';

import { PaginationCustom } from '@/shared/components/ui/pagination-custom';



export const CursosPage: React.FC = () => {

  const {

    cursos,

    pagination,

    isLoading: isLoadingList,

    error,

    deleteCurso,

    fetchCursos,

    deletingId,

    isFormOpen,

    selectedCurso,

    sortConfig,

    searchTerm,

    isLoading,

    form,

    setIsFormOpen,

    setSelectedCurso,

    setSortConfig,

    setSearchTerm,

    setDeletingId,

    handleFormSuccess,

    handleOpenCreate,

    handleOpenEdit,

    handleDeleteConfirm,

    handleSort,

    SortIcon,

    handleManualSubmit

  } = useCursos();



  return (

    <div className="space-y-6">

      <PageHeader

        firstChunkText="Gestão de"

        secondChunkText="Cursos"

        description="Visualize e gerencie os cursos e disciplinas da sua escola."

        onClick={handleOpenCreate}

        textAddButton='Novo Curso'

        searchPlaceholder='Pesquisar cursos...'

        search={setSearchTerm}

        searchTerm={searchTerm}

      />



      {error && (

        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">

          {error}

        </div>

      )}



      <div className="grid grid-cols-1 gap-4">

        {isLoadingList ? (

          <CustomCircularLoading />

        ) : cursos.length === 0 ? (

          <NoData

            icon={<NotebookText className="w-8 h-8" />}

            title="Nenhum curso encontrado"

            description="Comece cadastrando seu primeiro curso clicando no botão acima."

            onClick={handleOpenCreate}

            buttonText="Cadastrar Curso"

          />

        ) : (

          <>

            <CustomTable

              columns={[

                {

                  field: 'nome',

                  title: 'Curso',

                  icon: SortIcon,

                  sortable: true,

                  onSort: handleSort,

                },

                {

                  field: 'descricao',

                  title: 'Descrição',

                  icon: SortIcon,

                  sortable: true,

                  onSort: handleSort,

                },

                {

                  title: 'Ações',

                  sortable: false,

                },

              ]}

              rows={cursos.map(curso => ({

                renderField: (

                  <>

                    <CustomRow key={curso.id}>

                      <CustomColumn>

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">

                            {curso.nome.charAt(0).toUpperCase()}

                          </div>

                          <div>

                            <p className="text-sm font-bold text-zinc-900 leading-none">{curso.nome}</p>

                            <p className="text-[11px] text-zinc-500 mt-1">ID: #{curso.id}</p>

                          </div>

                        </div>

                      </CustomColumn>

                      <CustomColumn>

                        <p className="text-xs text-zinc-600 line-clamp-2 max-w-md">

                          {curso.descricao || <span className="text-zinc-400 italic">Sem descrição</span>}

                        </p>

                      </CustomColumn>

                      <CustomColumn className="text-right">

                        <div className="flex items-center justify-end gap-2">

                          <Button

                            variant="ghost"

                            size="icon"

                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                            onClick={() => handleOpenEdit(curso)}

                          >

                            <Edit className="w-4 h-4" />

                          </Button>

                          <Button

                            variant="ghost"

                            size="icon"

                            className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"

                            onClick={() => setDeletingId(curso.id)}

                          >

                            <Trash2 className="w-4 h-4" />

                          </Button>

                        </div>

                      </CustomColumn>

                    </CustomRow>

                  </>

                )

              }))}

              mobileCards={cursos.map(curso => ({

                header: (

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">

                      {curso.nome.charAt(0).toUpperCase()}

                    </div>

                    <div className="flex-1 min-w-0">

                      <h3 className="text-[15px] font-bold text-zinc-900 truncate">{curso.nome}</h3>

                      <p className="text-xs text-zinc-500 font-medium tracking-tight">ID: #{curso.id}</p>

                    </div>

                  </div>

                ),

                content: [

                  {

                    label: curso.descricao,

                  },

                ],

                buttons: (

                  <>

                    <Button

                      variant="outline"

                      size="sm"

                      className="h-9 rounded-full border-zinc-200 text-xs font-bold px-4 gap-2 flex-1"

                      onClick={() => handleOpenEdit(curso)}

                    >

                      <Edit className="w-4 h-4 text-indigo-600" />

                      Editar Curso

                    </Button>

                    <Button

                      variant="ghost"

                      size="icon"

                      className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50"

                      onClick={() => setDeletingId(curso.id)}

                    >

                      <Trash2 className="w-4 h-4" />

                    </Button>

                  </>

                ),

              }))}

            />

          </>

        )}



        {pagination && pagination.last_page > 1 && (

          <PaginationCustom

            currentPage={pagination.current_page}

            lastPage={pagination.last_page}

            onPageChange={(page) => fetchCursos(page, sortConfig.key, sortConfig.direction, searchTerm)}

            isLoading={isLoadingList}

          />

        )}

      </div>



      <CustomModalGlobal

        open={isFormOpen}

        close={setIsFormOpen}

        onClose={() => setIsFormOpen(false)}

        onConfirm={handleManualSubmit}

        firsChunkTitle={selectedCurso ? 'Editar' : 'Cadastrar'}

        secondChunkTitle='Curso'

        colorSecondChunkTitle='text-indigo-600'

        titleDescription={selectedCurso ? 'Altere os dados do curso selecionado.' : 'Preencha as informações para adicionar um novo curso.'}

        textCancelButton='Cancelar'

        textConfirmButton={selectedCurso ? 'Atualizar Curso' : 'Salvar Curso'}

        loadingText={'Salvando...'}

        isLoading={isLoading}

      >

        <CursoForm form={form} />

      </CustomModalGlobal>



      <CustomModalGlobal

        open={!!deletingId}

        close={setDeletingId}

        onClose={() => setDeletingId(null)}

        onConfirm={handleDeleteConfirm}

        firsChunkTitle='Excluir'

        secondChunkTitle='Curso'

        colorSecondChunkTitle='text-rose-600'

        titleDescription='Tem certeza que deseja excluir este curso?'

        textCancelButton='Cancelar'

        textConfirmButton='Excluir Curso'

        colorConfirmButton='rounded-full px-6 h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-100 hover:cursor-pointer'

        loadingText={'Excluindo...'}

        isLoading={isLoading}

      >

      </CustomModalGlobal>

    </div>

  );

};



export default CursosPage;
