"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Loader2, Edit, X, Download, MapPin, Phone, Mail, CreditCard, User, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { generateMyAppointmentsPDF, generateSingleAppointmentPDF, type PDFAppointment } from "@/lib/pdf-utils";

interface BookingService {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  serviceCategory: string;
  serviceSubcategory: string;
}

interface Booking {
  _id: string;
  userId: string;
  userName: string;
  professionalId?: string;
  professionalName?: string;
  services: BookingService[];
  date: string;
  timeSlot: string;
  status: "confirmed" | "cancelled" | "rescheduled" | "completed";
  payment: {
    amount: number;
    originalAmount: number;
    discount: number;
    paid: boolean;
    paidAt?: string;
    receiptSent: boolean;
  };
  notes?: string;
  reservedAt: string;
  canModify: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MisReservasPage() {
  const { isSignedIn, user, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      fetchBookings();
    }
  }, [isSignedIn]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        toast({
          title: "Error",
          description: "No se pudieron cargar las reservas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Error al cargar las reservas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Confirmada", variant: "default" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const },
      rescheduled: { label: "Reprogramada", variant: "secondary" as const },
      completed: { label: "Completada", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString: string, timeSlot?: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    if (timeSlot) {
      return `${dateStr}, ${timeSlot}`;
    }
    return dateStr;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price);
  };

  const getTotalPrice = (services: BookingService[]) => {
    return services.reduce((total, service) => total + service.servicePrice, 0);
  };

  const getServiceNames = (services: BookingService[]) => {
    if (services.length === 1) {
      return services[0].serviceName;
    }
    return services.map(s => s.serviceName).join(" + ");
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Reserva cancelada exitosamente",
        });
        fetchBookings();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "No se pudo cancelar la reserva",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      toast({
        title: "Error",
        description: "Error al cancelar la reserva",
        variant: "destructive",
      });
    }
  };

  // Función para obtener fecha local en formato YYYY-MM-DD sin problemas de zona horaria
  const getLocalDateString = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Agregar tiempo local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openEditDialog = (booking: Booking) => {
    setEditingBooking(booking);
    // Usar función local para evitar problemas de zona horaria
    setNewDate(getLocalDateString(booking.date));
    setNewTime(booking.timeSlot);
  };

  const updateBooking = async () => {
    if (!editingBooking || !newDate || !newTime) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${editingBooking._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          date: newDate,
          timeSlot: newTime,
        }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Cita reprogramada exitosamente",
        });
        setEditingBooking(null);
        fetchBookings();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "No se pudo reprogramar la cita",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
        description: "Error al reprogramar la cita",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Generar opciones de horario (9:00 a 19:00 cada 30 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const handleExportPDF = () => {
    if (bookings.length === 0) {
      toast({
        title: "Error",
        description: "No tienes citas para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdfAppointments: PDFAppointment[] = bookings.map(booking => ({
        date: booking.date,
        time: booking.timeSlot,
        service: getServiceNames(booking.services),
        professional: booking.professionalName || "Sin asignar",
        client: booking.userName,
        status: booking.status,
        price: getTotalPrice(booking.services),
        phone: "No disponible",
        email: "No disponible",
      }));

      generateMyAppointmentsPDF(pdfAppointments, { name: user?.email || "Usuario" });
      
      toast({
        title: "Éxito",
        description: "PDF de citas descargado exitosamente",
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

  const handleExportSingleBooking = (booking: Booking) => {
    try {
      const pdfAppointment: PDFAppointment = {
        date: booking.date,
        time: booking.timeSlot,
        service: getServiceNames(booking.services),
        professional: booking.professionalName || "Sin asignar",
        client: booking.userName,
        status: booking.status,
        price: getTotalPrice(booking.services),
        phone: "No disponible",
        email: "No disponible",
      };

      generateSingleAppointmentPDF(pdfAppointment);
      
      toast({
        title: "Éxito",
        description: `Comprobante descargado: ${getServiceNames(booking.services)}`,
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

  const getStatusColor = (status: string) => {
    const statusColors = {
      confirmed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      rescheduled: "bg-yellow-50 text-yellow-700 border-yellow-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "✅";
      case "completed":
        return "🎉";
      case "rescheduled":
        return "🔄";
      case "cancelled":
        return "❌";
      default:
        return "📅";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Acceso Requerido</h2>
              <p className="text-gray-600 mb-4">
                Debes iniciar sesión para ver tus citas
              </p>
              <Button asChild>
                <a href="/login">Iniciar Sesión</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Mis Citas</h1>
            <p className="text-purple-100 text-lg">
              Gestiona tus tratamientos de belleza y relajación
            </p>
            {bookings.length > 0 && (
              <div className="mt-6">
                <Button 
                  onClick={handleExportPDF} 
                  className="bg-white text-purple-600 hover:bg-purple-50 flex items-center mx-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todas las Citas
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-600">Cargando tus citas...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  ¡Tu primera cita te espera!
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Descubre nuestros tratamientos de spa premium y reserva tu momento de relajación perfecto.
                </p>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                >
                  <a href="/servicios">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Explorar Servicios
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Appointments List */}
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Left Color Bar */}
                      <div className={`w-2 ${
                        booking.status === "confirmed" ? "bg-green-500" :
                        booking.status === "completed" ? "bg-blue-500" :
                        booking.status === "rescheduled" ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}></div>
                      
                      {/* Main Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Service Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 rounded-lg">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                  {getServiceNames(booking.services)}
                                </h3>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                                  <span className="mr-1">{getStatusIcon(booking.status)}</span>
                                  {getStatusBadge(booking.status).props.children}
                                </div>
                              </div>
                            </div>
                            
                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-3 text-gray-600">
                                <Calendar className="h-5 w-5 text-purple-500" />
                                <div>
                                  <p className="text-sm font-medium">Fecha y Hora</p>
                                  <p className="text-sm">
                                    {formatDateTime(booking.date, booking.timeSlot)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3 text-gray-600">
                                <CreditCard className="h-5 w-5 text-green-500" />
                                <div>
                                  <p className="text-sm font-medium">Precio</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-purple-600">
                                      {formatPrice(getTotalPrice(booking.services))}
                                    </span>
                                    {booking.payment.paid && (
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                        ✓ Pagado
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Professional Info */}
                            {booking.professionalName && (
                              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">
                                    Profesional: {booking.professionalName}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 ml-6">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportSingleBooking(booking)}
                              className="flex items-center bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Comprobante
                            </Button>

                            {(booking.status === "confirmed" || booking.status === "rescheduled") && booking.canModify && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditDialog(booking)}
                                      className="flex items-center"
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle className="text-center">Reprogramar Cita</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div>
                                        <Label htmlFor="date" className="text-sm font-medium">Nueva Fecha</Label>
                                        <Input
                                          id="date"
                                          type="date"
                                          value={newDate}
                                          onChange={(e) => setNewDate(e.target.value)}
                                          min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="time" className="text-sm font-medium">Nueva Hora</Label>
                                        <select
                                          id="time"
                                          value={newTime}
                                          onChange={(e) => setNewTime(e.target.value)}
                                          className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                          {generateTimeSlots().map((slot) => (
                                            <option key={slot} value={slot}>
                                              {slot}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="flex gap-2 pt-4">
                                        <Button
                                          onClick={updateBooking}
                                          disabled={isUpdating}
                                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                                        >
                                          {isUpdating ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          ) : null}
                                          Confirmar Cambios
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setEditingBooking(null)}
                                          disabled={isUpdating}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => cancelBooking(booking._id)}
                                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancelar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
