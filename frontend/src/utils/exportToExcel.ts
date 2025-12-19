/**
 * Client-side Excel export utility
 * No backend API needed - uses xlsx library to convert JSON to Excel in browser
 */

import * as XLSX from 'xlsx';

/**
 * Export array of objects to Excel file
 * @param data - Array of objects to export
 * @param filename - Base filename (without extension)
 */
export function exportToExcel(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create worksheet from JSON data
  const ws = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate and download file
  XLSX.writeFile(wb, `${filename}-${Date.now()}.xlsx`);
}
