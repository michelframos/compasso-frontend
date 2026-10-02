export interface Curso {
  id: number;
  nome: string;
  descricao: string | null;
  contrato_id: number | null;
}

export interface CursoFormData {
  nome: string;
  descricao: string;
  contrato_id?: number | null;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
