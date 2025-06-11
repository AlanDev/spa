declare module 'jspdf' {
  export default class jsPDF {
    constructor(orientation?: string, unit?: string, format?: string | number[]);
    
    text(text: string, x: number, y: number, options?: any): void;
    setFontSize(size: number): void;
    setFont(fontName?: string, fontStyle?: string): void;
    setDrawColor(r: number, g: number, b: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    addPage(): void;
    save(filename: string): void;
    getNumberOfPages(): number;
    setPage(page: number): void;
    
    internal: {
      pageSize: {
        width: number;
        height: number;
      };
    };
  }
}

declare module 'jspdf-autotable' {
  interface AutoTableOptions {
    columns?: any[];
    body?: any[];
    startY?: number;
    styles?: any;
    headStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
  }
  
  export default function autoTable(doc: any, options: AutoTableOptions): void;
} 