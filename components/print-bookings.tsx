"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from 'jspdf';

interface Booking {
  _id: string;
  userName: string;
  userId: string;
  services: Array<{
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    serviceCategory: string;
  }>;
  date: string;
  timeSlot: string;
  status: "confirmed" | "cancelled" | "rescheduled" | "completed";
  payment: {
    amount: number;
    paid: boolean;
  };
  notes?: string;
  treatmentNotes?: {
    notes: string;
    addedAt: string;
    addedByName: string;
  };
}

interface PrintBookingsProps {
  bookings: Booking[];
  professionalName: string;
  startDate: string;
  endDate: string;
}

export default function PrintBookings({ bookings, professionalName, startDate, endDate }: PrintBookingsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDateDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalDuration = (services: Booking['services']) => {
    return services.reduce((total, service) => total + service.serviceDuration, 0);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'rescheduled': return 'Reprogramada';
      default: return status;
    }
  };

  const groupBookingsByDate = () => {
    const grouped: { [key: string]: Booking[] } = {};
    bookings.forEach((booking) => {
      const dateKey = booking.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });
    
    // Ordenar las reservas de cada día por hora
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        const timeA = a.timeSlot.split(':').map(Number);
        const timeB = b.timeSlot.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
    });
    
    return grouped;
  };

  const handleGeneratePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Configurar fuente
      doc.setFont('helvetica');
      
      // Título
      doc.setFontSize(20);
      doc.text('Reporte de Turnos', 105, 20, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(14);
      doc.text(`Dr/a. ${professionalName}`, 105, 30, { align: 'center' });
      
      // Período
      doc.setFontSize(12);
      doc.text(`Período: ${new Date(startDate).toLocaleDateString('es-ES')} - ${new Date(endDate).toLocaleDateString('es-ES')}`, 105, 40, { align: 'center' });
      
      // Fecha de generación
      doc.setFontSize(10);
      doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 105, 50, { align: 'center' });
      
      // Estadísticas generales
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen del Período', 20, 70);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total de turnos: ${bookings.length}`, 20, 80);
      doc.text(`Turnos confirmados: ${bookings.filter(b => b.status === 'confirmed').length}`, 20, 90);
      doc.text(`Turnos completados: ${bookings.filter(b => b.status === 'completed').length}`, 20, 100);
      doc.text(`Total facturado: ${formatCurrency(bookings.reduce((total, b) => total + b.payment.amount, 0))}`, 20, 110);
      
      // Lista de turnos
      let yPosition = 130;
      
      const groupedBookings = groupBookingsByDate();
      const dateKeys = Object.keys(groupedBookings).sort();
      
      dateKeys.forEach((dateKey) => {
        const dateBookings = groupedBookings[dateKey];
        
        // Verificar si necesitamos una nueva página
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Título de fecha
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${formatDateDisplay(dateKey)} (${dateBookings.length} citas)`, 20, yPosition);
        yPosition += 10;
        
        // Lista de turnos para esta fecha
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        dateBookings.forEach((booking) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Información del turno
          doc.text(`${booking.timeSlot} - ${booking.userName}`, 25, yPosition);
          yPosition += 5;
          
          doc.text(`Servicios: ${booking.services.map(s => s.serviceName).join(', ')}`, 25, yPosition);
          yPosition += 5;
          
          doc.text(`Duración: ${getTotalDuration(booking.services)} min | Estado: ${getStatusText(booking.status)} | Total: ${formatCurrency(booking.payment.amount)}`, 25, yPosition);
          yPosition += 8;
          
          // Agregar notas si existen
          if (booking.notes) {
            doc.text(`Nota: ${booking.notes}`, 25, yPosition);
            yPosition += 5;
          }
          
          if (booking.treatmentNotes) {
            doc.text(`Tratamiento: ${booking.treatmentNotes.notes}`, 25, yPosition);
            yPosition += 5;
          }
          
          yPosition += 3; // Espacio entre turnos
        });
        
        yPosition += 10; // Espacio entre días
      });
      
      // Descargar PDF
      const fileName = `turnos_${professionalName.replace(/\s+/g, '_')}_${startDate}_${endDate}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  return (
    <Button
      onClick={handleGeneratePDF}
      variant="outline"
      className="text-purple-600 border-purple-600 hover:bg-purple-50"
    >
      <Download className="h-4 w-4 mr-2" />
      Descargar PDF
    </Button>
  );
} 