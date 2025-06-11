"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, User, DollarSign, CheckCircle, XCircle, Edit, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Booking {
  _id: string;
  userName: string;
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
}

export default function MiAgendaPage() {
  const { user, isProfesional } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fechas por defecto: hoy hasta en 7 días
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);

  useEffect(() => {
    if (isProfesional && user) {
      fetchBookings();
    }
  }, [isProfesional, user, startDate, endDate]);

  const fetchBookings = async () => {
    try {
      if (!user?.id) return;
      
      const response = await fetch(`/api/professional/bookings?professionalId=${user.id}&startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.bookings || []);
      } else {
        console.error('Error fetching bookings:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Calendar className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'rescheduled': return <Edit className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/professional/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getTotalDuration = (services: Booking['services']) => {
    return services.reduce((total, service) => total + service.serviceDuration, 0);
  };

  const formatDateDisplay = (dateString: string) => {
    // Usar construcción local para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Agrupar reservas por fecha
  const groupBookingsByDate = () => {
    const grouped: { [key: string]: Booking[] } = {};
    
    bookings.forEach(booking => {
      const dateKey = booking.date.split('T')[0]; // Solo la parte de fecha YYYY-MM-DD
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });

    // Ordenar cada grupo por hora
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
    });

    return grouped;
  };

  const setQuickRange = (days: number) => {
    const start = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
  };

  if (!isProfesional) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">Esta página es solo para profesionales.</p>
        </div>
      </div>
    );
  }

  const groupedBookings = groupBookingsByDate();
  const dateKeys = Object.keys(groupedBookings).sort();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Agenda</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus citas y turnos programados
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col gap-4">
          {/* Botones de rango rápido */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange(0)}
            >
              Hoy
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange(7)}
            >
              Esta semana
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange(30)}
            >
              Este mes
            </Button>
          </div>
          
          {/* Selector de rango de fechas */}
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-gray-500" />
              <label className="text-sm text-gray-600">Desde:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Hasta:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando agenda...</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas en este periodo</h3>
            <p className="text-gray-600">
              Del {new Date(startDate).toLocaleDateString('es-ES')} al {new Date(endDate).toLocaleDateString('es-ES')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Resumen del periodo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarRange className="h-5 w-5" />
                Resumen del periodo ({new Date(startDate).toLocaleDateString('es-ES')} - {new Date(endDate).toLocaleDateString('es-ES')})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{bookings.length}</div>
                  <div className="text-sm text-gray-600">Total Citas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </div>
                  <div className="text-sm text-gray-600">Confirmadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {bookings.filter(b => b.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(bookings.reduce((total, b) => total + b.payment.amount, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total Facturado</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de citas agrupadas por fecha */}
          <div className="space-y-6">
            {dateKeys.map((dateKey) => (
              <div key={dateKey}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-purple-500 pl-4">
                  {formatDateDisplay(dateKey)} ({groupedBookings[dateKey].length} citas)
                </h2>
                
                <div className="space-y-4">
                  {groupedBookings[dateKey].map((booking) => (
                    <Card key={booking._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-semibold text-lg">{booking.timeSlot}</span>
                              </div>
                              <Badge className={getStatusColor(booking.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(booking.status)}
                                  {booking.status === 'confirmed' ? 'Confirmada' :
                                   booking.status === 'completed' ? 'Completada' :
                                   booking.status === 'cancelled' ? 'Cancelada' : 'Reprogramada'}
                                </div>
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{booking.userName}</span>
                              </div>

                              <div className="space-y-1">
                                {booking.services.map((service, index) => (
                                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div>
                                      <span className="font-medium">{service.serviceName}</span>
                                      <span className="text-sm text-gray-600 ml-2">
                                        ({service.serviceCategory})
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium">
                                        {formatCurrency(service.servicePrice)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {service.serviceDuration} min
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Duración total: {getTotalDuration(booking.services)} min</span>
                                <span>•</span>
                                <span>Pago: {booking.payment.paid ? '✅ Pagado' : '⏳ Pendiente'}</span>
                              </div>

                              {booking.notes && (
                                <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                                  <p className="text-sm text-yellow-800">
                                    <strong>Nota:</strong> {booking.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 md:ml-6 flex flex-col gap-2">
                            {booking.status === 'confirmed' && (
                              <Button
                                onClick={() => updateBookingStatus(booking._id, 'completed')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completar
                              </Button>
                            )}
                            
                            {booking.status === 'confirmed' && (
                              <Button
                                onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 