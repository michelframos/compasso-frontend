import * as XLSX from 'xlsx';

/**
 * Utilitário para exportar um array de objetos para um arquivo Excel (.xlsx)
 * @param data Array de objetos com os dados
 * @param fileName Nome do arquivo a ser gerado (sem extensão)
 * @param sheetName Nome da aba no Excel
 */
export const exportToExcel = (data: Record<string, unknown>[], fileName: string, sheetName: string = 'Relatório') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

/**
 * Utilitário para acionar a impressão do navegador (PDF)
 */
export const exportToPDF = () => {
  window.print();
};
