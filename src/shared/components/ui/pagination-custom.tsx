import React from 'react';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';



interface PaginationProps {

  currentPage: number;

  lastPage: number;

  onPageChange: (page: number) => void;

  isLoading?: boolean;

}



export const PaginationCustom: React.FC<PaginationProps> = ({

  currentPage,

  lastPage,

  onPageChange,

  isLoading = false,

}) => {

  if (lastPage <= 1) return null;



  return (

    <div className="flex items-center justify-between px-2 py-4 border-t border-zinc-100">

      <div className="text-sm text-zinc-500">

        Página <span className="font-medium text-zinc-700">{currentPage}</span> de{' '}

        <span className="font-medium text-zinc-700">{lastPage}</span>

      </div>

      <div className="flex items-center gap-2">

        <Button

          variant="outline"

          size="icon"

          className="h-8 w-8 rounded-lg border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600 disabled:opacity-50 hover:cursor-pointer"

          onClick={() => onPageChange(1)}

          disabled={currentPage === 1 || isLoading}

          title="Primeira página"

        >

          <ChevronsLeft className="h-4 w-4" />

        </Button>

        <Button

          variant="outline"

          size="icon"

          className="h-8 w-8 rounded-lg border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600 disabled:opacity-50 hover:cursor-pointer"

          onClick={() => onPageChange(currentPage - 1)}

          disabled={currentPage === 1 || isLoading}

          title="Anterior"

        >

          <ChevronLeft className="h-4 w-4" />

        </Button>



        <div className="flex items-center gap-1 mx-2">

          {/* Mostra um intervalo de páginas proximas */}

          {[...Array(Math.min(5, lastPage))].map((_, i) => {

            let pageNumber: number;

            if (lastPage <= 5) {

              pageNumber = i + 1;

            } else if (currentPage <= 3) {

              pageNumber = i + 1;

            } else if (currentPage >= lastPage - 2) {

              pageNumber = lastPage - 4 + i;

            } else {

              pageNumber = currentPage - 2 + i;

            }



            return (

              <Button

                key={pageNumber}

                variant={currentPage === pageNumber ? 'default' : 'outline'}

                size="sm"

                className={`h-8 w-8 rounded-lg font-bold text-xs hover:cursor-pointer ${

                  currentPage === pageNumber 

                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100' 

                    : 'border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600'

                }`}

                onClick={() => onPageChange(pageNumber)}

                disabled={isLoading}

              >

                {pageNumber}

              </Button>

            );

          })}

        </div>



        <Button

          variant="outline"

          size="icon"

          className="h-8 w-8 rounded-lg border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600 disabled:opacity-50 hover:cursor-pointer"

          onClick={() => onPageChange(currentPage + 1)}

          disabled={currentPage === lastPage || isLoading}

          title="Próxima"

        >

          <ChevronRight className="h-4 w-4" />

        </Button>

        <Button

          variant="outline"

          size="icon"

          className="h-8 w-8 rounded-lg border-zinc-200 hover:bg-zinc-50 hover:text-indigo-600 disabled:opacity-50 hover:cursor-pointer"

          onClick={() => onPageChange(lastPage)}

          disabled={currentPage === lastPage || isLoading}

          title="Última página"

        >

          <ChevronsRight className="h-4 w-4" />

        </Button>

      </div>

    </div>

  );

};
