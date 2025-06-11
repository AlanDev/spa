import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PDFAppointment {
  date: string;
  time: string;
  service: string;
  professional: string;
  client: string;
  status: string;
  price: number;
  phone?: string;
  email?: string;
}

export interface PDFReportData {
  title: string;
  date: string;
  summary?: {
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    totalRevenue: number;
  };
  appointments: PDFAppointment[];
}

export const generatePDF = (data: PDFReportData): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("SPA Sentirse Bien", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text(data.title, 105, 35, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`Fecha: ${data.date}`, 20, 50);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 20, 60);
  
  let yPosition = 75;
  
  // Summary (if provided)
  if (data.summary) {
    doc.setFontSize(14);
    doc.text("Resumen", 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Total de Citas: ${data.summary.totalAppointments}`, 20, yPosition);
    doc.text(`Confirmadas: ${data.summary.confirmedAppointments}`, 70, yPosition);
    doc.text(`Reprogramadas: ${data.summary.pendingAppointments}`, 120, yPosition);
    doc.text(`Canceladas: ${data.summary.cancelledAppointments}`, 170, yPosition);
    yPosition += 8;
    
    doc.text(`Ingresos Totales: $${data.summary.totalRevenue.toFixed(2)}`, 20, yPosition);
    yPosition += 15;
  }
  
  // Appointments table
  if (data.appointments.length > 0) {
    doc.setFontSize(14);
    doc.text("Citas", 20, yPosition);
    yPosition += 5;
    
    const tableColumns = [
      { header: "Fecha", dataKey: "date" },
      { header: "Hora", dataKey: "time" },
      { header: "Servicio", dataKey: "service" },
      { header: "Profesional", dataKey: "professional" },
      { header: "Cliente", dataKey: "client" },
      { header: "Estado", dataKey: "status" },
      { header: "Precio", dataKey: "price" },
    ];
    
    const tableRows = data.appointments.map(appointment => ({
      date: new Date(appointment.date).toLocaleDateString('es-ES'),
      time: appointment.time,
      service: appointment.service,
      professional: appointment.professional,
      client: appointment.client,
      status: appointment.status === "confirmed" ? "Confirmada" :
               appointment.status === "completed" ? "Completada" :
               appointment.status === "rescheduled" ? "Reprogramada" :
               appointment.status === "cancelled" ? "Cancelada" :
               appointment.status,
      price: `$${appointment.price.toFixed(2)}`,
    }));
    
    autoTable(doc, {
      columns: tableColumns,
      body: tableRows,
      startY: yPosition + 5,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [139, 92, 246], // Purple color
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Light gray
      },
      columnStyles: {
        0: { cellWidth: 20 }, // Fecha
        1: { cellWidth: 20 }, // Hora
        2: { cellWidth: 35 }, // Servicio
        3: { cellWidth: 35 }, // Profesional
        4: { cellWidth: 35 }, // Cliente
        5: { cellWidth: 25 }, // Estado
        6: { cellWidth: 20 }, // Precio
      },
    });
  } else {
    doc.text("No hay citas para mostrar", 20, yPosition + 10);
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Download
  const fileName = `${data.title.toLowerCase().replace(/\s+/g, '_')}_${data.date.replace(/-/g, '')}.pdf`;
  doc.save(fileName);
};

export const generateMyAppointmentsPDF = (appointments: PDFAppointment[], userInfo: { name: string }) => {
  const data: PDFReportData = {
    title: "Mis Citas",
    date: new Date().toLocaleDateString('es-ES'),
    appointments: appointments,
  };
  
  generatePDF(data);
};

export const generateDailyReportPDF = (
  date: string,
  summary: PDFReportData['summary'],
  appointments: PDFAppointment[]
) => {
  const formattedDate = new Date(date).toLocaleDateString('es-ES');
  
  const data: PDFReportData = {
    title: "Reporte Diario",
    date: formattedDate,
    summary,
    appointments,
  };
  
  generatePDF(data);
};

export const generateSingleAppointmentPDF = (appointment: PDFAppointment, reportType: "daily" | "personal" = "personal") => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("SPA Sentirse Bien", 105, 20, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("Comprobante de Cita", 105, 35, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 20, 50);
  
  let yPosition = 70;
  
  // Appointment details
  doc.setFontSize(14);
  doc.text("Detalles de la Cita", 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  
  // Create a nice formatted layout
  const details = [
    { label: "Fecha:", value: new Date(appointment.date).toLocaleDateString('es-ES') },
    { label: "Hora:", value: appointment.time },
    { label: "Servicio:", value: appointment.service },
    { label: "Profesional:", value: appointment.professional },
    { label: "Cliente:", value: appointment.client },
    { label: "Estado:", value: appointment.status === "confirmed" ? "Confirmada" :
                               appointment.status === "completed" ? "Completada" :
                               appointment.status === "rescheduled" ? "Reprogramada" :
                               appointment.status === "cancelled" ? "Cancelada" :
                               appointment.status },
    { label: "Precio:", value: `$${appointment.price.toFixed(2)}` },
  ];
  
  if (appointment.phone && appointment.phone !== "No disponible") {
    details.push({ label: "Teléfono:", value: appointment.phone });
  }
  
  if (appointment.email && appointment.email !== "No disponible") {
    details.push({ label: "Email:", value: appointment.email });
  }
  
  details.forEach((detail) => {
    doc.setFont(undefined, "bold");
    doc.text(detail.label, 20, yPosition);
    doc.setFont(undefined, "normal");
    doc.text(detail.value, 60, yPosition);
    yPosition += 8;
  });
  
  // Add some styling
  yPosition += 10;
  doc.setDrawColor(139, 92, 246); // Purple color
  doc.line(20, yPosition, 190, yPosition); // Horizontal line
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setFont(undefined, "italic");
  doc.text("Gracias por elegir SPA Sentirse Bien", 105, yPosition, { align: "center" });
  doc.text("Para cancelaciones o cambios, contacte con 48hs de anticipación", 105, yPosition + 8, { align: "center" });
  
  // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text(
    "Página 1 de 1",
    doc.internal.pageSize.width - 30,
    doc.internal.pageSize.height - 10
  );
  
  // Download
  const clientName = appointment.client.toLowerCase().replace(/\s+/g, '_');
  const dateTime = appointment.time.replace(':', '');
  const fileName = `cita_${clientName}_${dateTime}.pdf`;
  doc.save(fileName);
}; 