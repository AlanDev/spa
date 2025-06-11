"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, DollarSign, FileText, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { generateDailyReportPDF, generateSingleAppointmentPDF, type PDFAppointment } from "@/lib/pdf-utils";

interface Appointment {
  id: string;
  time: string;
  service: string;
  professional: string;
  client: string;
  status: string;
  price: number;
  phone: string;
  email: string;
}

interface DailyReport {
  date: string;
  summary: {
    totalAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    totalRevenue: number;
  };
  appointments: Appointment[];
}

// Función para obtener fecha local en formato YYYY-MM-DD sin problemas de zona horaria
const getLocalDateString = (date?: Date) => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para formatear fecha para mostrar al usuario
const formatDateForDisplay = (dateString: string) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export default function ReportesDiariosPage() {
  const { isSignedIn, isDraAnaFelicidad, isProfesional, loading } = useAuth();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  useEffect(() => {
    console.log("🔍 REPORTES: useEffect triggered");
    console.log("🔍 REPORTES: loading:", loading);
    console.log("🔍 REPORTES: isSignedIn:", isSignedIn);
    console.log("🔍 REPORTES: isDraAnaFelicidad:", isDraAnaFelicidad);
    console.log("🔍 REPORTES: isProfesional:", isProfesional);
    
    if (!loading && !isSignedIn) {
      console.log("❌ REPORTES: Redirecting to login - not signed in");
      redirect("/login");
    }
    if (!loading && isSignedIn && !isDraAnaFelicidad && !isProfesional) {
      console.log("❌ REPORTES: Redirecting to home - no permissions");
      redirect("/");
    }
    
    console.log("✅ REPORTES: No redirect needed");
  }, [isSignedIn, isDraAnaFelicidad, isProfesional, loading]);

  const fetchDailyReport = async (date: string) => {
    try {
      setReportLoading(true);
      setError(null);

      // Agregar cache busting para forzar datos frescos
      const cacheBuster = Date.now();
      const response = await fetch(
        `/api/reports/daily-appointments?date=${date}&_=${cacheBuster}`,
        {
          credentials: "include",
          cache: "no-cache", // Evitar cache del navegador
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        }
      );

      console.log("API Response status:", response.status);
      console.log("API Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        console.log("API Error data:", errorData);
        
        if (response.status === 403) {
          throw new Error("No tiene permisos para acceder a esta información");
        }
        if (response.status === 401) {
          throw new Error("No está autenticado. Por favor, inicie sesión nuevamente");
        }
        throw new Error(errorData.error || `Error del servidor (${response.status})`);
      }

      const data = await response.json();
      console.log("🔍 FRONTEND: API Success data:", data);
      console.log("🔍 FRONTEND: Report summary:", data.report?.summary);
      console.log("🔍 FRONTEND: Appointments count:", data.report?.appointments?.length);
      setReport(data.report);
    } catch (err) {
      console.error("Error fetching daily report:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al generar el reporte",
        variant: "destructive",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchDailyReport(date);
  };

  const handleExportPDF = () => {
    if (!report) {
      toast({
        title: "Error",
        description: "No hay datos del reporte para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdfAppointments: PDFAppointment[] = report.appointments.map(appointment => ({
        date: report.date,
        time: appointment.time,
        service: appointment.service,
        professional: appointment.professional,
        client: appointment.client,
        status: appointment.status,
        price: appointment.price,
        phone: appointment.phone,
        email: appointment.email,
      }));

      generateDailyReportPDF(report.date, report.summary, pdfAppointments);
      
      toast({
        title: "Éxito",
        description: "Reporte PDF descargado exitosamente",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Error al generar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportSingleAppointment = (appointment: Appointment) => {
    try {
      const pdfAppointment: PDFAppointment = {
        date: report?.date || selectedDate,
        time: appointment.time,
        service: appointment.service,
        professional: appointment.professional,
        client: appointment.client,
        status: appointment.status,
        price: appointment.price,
        phone: appointment.phone,
        email: appointment.email,
      };

      generateSingleAppointmentPDF(pdfAppointment);
      
      toast({
        title: "Éxito",
        description: `Comprobante de cita descargado: ${appointment.client}`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Error al generar el comprobante",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!loading && isSignedIn && (isDraAnaFelicidad || isProfesional)) {
      fetchDailyReport(selectedDate);
    }
  }, [isSignedIn, isDraAnaFelicidad, isProfesional, loading, selectedDate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reportes Diarios
          </h1>
          <p className="mt-2 text-gray-600">
            Visualiza las citas y estadísticas de un día específico
          </p>
        </div>
        {report && (
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Reporte Completo
            </Button>
            <Button 
              onClick={() => fetchDailyReport(selectedDate)} 
              variant="outline" 
              className="flex items-center"
            >
              🔄 Refrescar Datos
            </Button>
          </div>
        )}
      </div>

      {/* Selector de fecha */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seleccionar Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-sm">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={() => fetchDailyReport(selectedDate)}
              disabled={reportLoading}
              className="mt-6"
            >
              {reportLoading ? "Cargando..." : "Generar Reporte"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {report && (
        <>
          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Fecha</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDateForDisplay(report.date)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Citas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.summary.totalAppointments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ingresos Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${report.summary.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {report.summary.confirmedAppointments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de citas */}
          <Card>
            <CardHeader>
              <CardTitle>Citas del Día</CardTitle>
            </CardHeader>
            <CardContent>
              {report.appointments.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No hay citas para esta fecha</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-sm font-semibold">
                          {appointment.time}
                        </div>
                        <div>
                          <p className="font-medium">{appointment.service}</p>
                          <p className="text-sm text-gray-600">
                            Cliente: {appointment.client} • 
                            Profesional: {appointment.professional}
                          </p>
                          <p className="text-sm text-gray-500">
                            Tel: {appointment.phone} • Email: {appointment.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-semibold">
                            ${appointment.price.toFixed(2)}
                          </p>
                          <Badge 
                            variant={
                              appointment.status === "confirmed" ? "default" :
                              appointment.status === "completed" ? "default" :
                              appointment.status === "rescheduled" ? "secondary" :
                              "destructive"
                            }
                          >
                            {appointment.status === "confirmed" ? "Confirmada" :
                             appointment.status === "completed" ? "Completada" :
                             appointment.status === "rescheduled" ? "Reprogramada" :
                             appointment.status === "cancelled" ? "Cancelada" :
                             appointment.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportSingleAppointment(appointment)}
                          className="flex items-center"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 