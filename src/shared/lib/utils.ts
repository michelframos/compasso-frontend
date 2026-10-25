import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Remove a máscara do CNPJ (aceita o formato alfanumérico). */
export function unmaskCnpj(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14)
}

/** Aplica a máscara 00.000.000/0000-00 progressivamente enquanto o usuário digita. */
export function formatCnpj(value: string): string {
  return unmaskCnpj(value)
    .replace(/^(.{2})(.)/, '$1.$2')
    .replace(/^(.{2})\.(.{3})(.)/, '$1.$2.$3')
    .replace(/^(.{2})\.(.{3})\.(.{3})(.)/, '$1.$2.$3/$4')
    .replace(/^(.{2})\.(.{3})\.(.{3})\/(.{4})(.)/, '$1.$2.$3/$4-$5')
}

export function unmaskCep(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8)
}

/** Aplica a máscara 00000-000 progressivamente enquanto o usuário digita. */
export function formatCep(value: string): string {
  return unmaskCep(value).replace(/^(\d{5})(\d)/, '$1-$2')
}

/**
 * Extrai a mensagem de erro de uma exceção Axios.
 * Prioriza mensagens retornadas pelo backend (message e errors de validação).
 * Usa fallbackMessage caso nenhuma mensagem esteja disponível.
 */
export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  const axiosError = error as AxiosError<{
    message?: string;
    errors?: Record<string, string[]>;
  }>;

  const data = axiosError?.response?.data;

  if (data?.errors) {
    const allMessages = Object.values(data.errors).flat();
    if (allMessages.length > 0) {
      return allMessages.join(' ');
    }
  }

  if (data?.message) {
    return data.message;
  }

  if (axiosError?.message && axiosError.message !== 'Network Error') {
    return axiosError.message;
  }

  return fallbackMessage;
}
