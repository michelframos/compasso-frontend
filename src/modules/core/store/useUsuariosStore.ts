import { create } from 'zustand';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    role: string;
    telefone: string | null;
    whatsapp: string | null;
    foto?: string;
    created_at: string;
    updated_at: string;
}

interface UsuariosState {
    usuarios: Usuario[];
    isLoading: boolean;
    currentPage: number;
    lastPage: number;
    total: number;
    setUsuarios: (usuarios: Usuario[]) => void;
    setUsuariosData: (usuarios: Usuario[], meta: any) => void;
    addUsuario: (usuario: Usuario) => void;
    updateUsuario: (usuario: Usuario) => void;
    removeUsuario: (id: number) => void;
    setIsLoading: (loading: boolean) => void;
}

export const useUsuariosStore = create<UsuariosState>((set) => ({
    usuarios: [],
    isLoading: false,
    currentPage: 1,
    lastPage: 1,
    total: 0,
    setUsuarios: (usuarios) => set({ usuarios }),
    setUsuariosData: (usuarios, meta) => set({ 
        usuarios, 
        currentPage: meta?.current_page || 1, 
        lastPage: meta?.last_page || 1, 
        total: meta?.total || 0 
    }),
    addUsuario: (usuario) => set((state) => ({ usuarios: [usuario, ...state.usuarios] })),
    updateUsuario: (updatedUsuario) => set((state) => ({
        usuarios: state.usuarios.map((u) => u.id === updatedUsuario.id ? updatedUsuario : u)
    })),
    removeUsuario: (id) => set((state) => ({
        usuarios: state.usuarios.filter((u) => u.id !== id)
    })),
    setIsLoading: (isLoading) => set({ isLoading }),
}));
