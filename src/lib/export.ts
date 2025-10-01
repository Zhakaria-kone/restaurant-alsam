import type { Attendee } from '@shared/types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Function to export data to CSV
export const exportToCSV = (data: Attendee[], filename: string) => {
  const headers = ['First Name', 'Last Name', 'Room Number', 'Breakfast Status'];
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      [
        `"${row.firstName}"`,
        `"${row.lastName}"`,
        `"${row.roomNumber}"`,
        `"${row.breakfastStatus}"`
      ].join(',')
    )
  ];
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
// Function to export data to PDF
export const exportToPDF = (data: Attendee[], title: string) => {
  const doc = new jsPDF();
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
  doc.autoTable({
    startY: 30,
    head: [['First Name', 'Last Name', 'Room Number', 'Breakfast Status']],
    body: data.map(row => [row.firstName, row.lastName, row.roomNumber, row.breakfastStatus]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] }, // Blue header
    styles: { fontSize: 9 },
  });
  doc.save(`breakfast-report.pdf`);
};