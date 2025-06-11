"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, User, Bell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TomorrowBooking {
  _id: string;
  userName: string;
  services: Array<{
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    serviceCategory: string;
  }>;
  timeSlot: string;
  status: "confirmed" | "cancelled" | "rescheduled" | "completed";
  payment: {
    method: string;
    amount: number;
    paid: boolean;
  };
  notes?: string;
}

export default function TurnosMananaPage() {
  const { user, isProfesional } = useAuth();
  const [bookings, setBookings] = useState<TomorrowBooking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calcular fecha de mañana
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];
  const tomorrowFormatted = tomorrow.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    if (isProfesional && user?.id) {
      fetchTomorrowBookings();
    }
  }, [isProfesional, user]);

  const fetchTomorrowBookings = async () => {
    try {
      if (!user?.id) return;
      
      const response = await fetch(`/api/professional/bookings?professionalId=${user.id}&date=${tomorrowDate}`);
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data.bookings || []);
      } else {
        console.error('Error fetching tomorrow bookings:', data.error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getTotalDuration = (services: TomorrowBooking['services']) => {
    return services.reduce((total, service) => total + service.serviceDuration, 0);
  };

  const getTimeSlotColor = (timeSlot: string) => {
    const hour = parseInt(timeSlot.split(':')[0]);
    if (hour < 12) return 'bg-blue-50 border-blue-200';
    if (hour < 17) return 'bg-green-50 border-green-200';
    return 'bg-purple-50 border-purple-200';
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    const hour = parseInt(timeSlot.split(':')[0]);
    if (hour < 12) return 'Mañana';
    if (hour < 17) return 'Tarde';
    return 'Noche';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Turnos de Mañana</h1>
        </div>
        <p className="text-gray-600">
          Tus citas programadas para <span className="font-semibold text-purple-600">{tomorrowFormatted}</span>
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando turnos...</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay turnos para mañana</h3>
            <p className="text-gray-600">¡Tendrás un día libre! 🌟</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Resumen de mañana */}
          <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Resumen de mañana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{bookings.length}</div>
                  <div className="text-sm opacity-90">Total Citas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {bookings.reduce((total, b) => total + getTotalDuration(b.services), 0)} min
                  </div>
                  <div className="text-sm opacity-90">Tiempo Total</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {formatCurrency(bookings.reduce((total, b) => total + b.payment.amount, 0))}
                  </div>
                  <div className="text-sm opacity-90">Ingresos Esperados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horario del día */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma del Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                  .map((booking, index) => (
                    <div key={booking._id} className={`border-2 rounded-lg p-4 ${getTimeSlotColor(booking.timeSlot)}`}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-gray-600" />
                              <span className="font-bold text-xl">{booking.timeSlot}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getTimeSlotLabel(booking.timeSlot)}
                            </Badge>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status === 'confirmed' ? 'Confirmada' :
                               booking.status === 'completed' ? 'Completada' :
                               booking.status === 'cancelled' ? 'Cancelada' : 'Reprogramada'}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-lg">{booking.userName}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {booking.services.map((service, serviceIndex) => (
                                <div key={serviceIndex} className="bg-white p-3 rounded border">
                                  <div className="font-medium">{service.serviceName}</div>
                                  <div className="text-sm text-gray-600">{service.serviceCategory}</div>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-sm font-medium text-green-600">
                                      {formatCurrency(service.servicePrice)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {service.serviceDuration} min
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600 bg-white p-2 rounded">
                              <span>⏱️ Duración: {getTotalDuration(booking.services)} min</span>
                              <span>💰 Total: {formatCurrency(booking.payment.amount)}</span>
                              <span>
                                {booking.payment.paid ? '✅ Pagado' : '⏳ Pendiente'}
                              </span>
                            </div>

                            {booking.notes && (
                              <div className="bg-yellow-100 p-2 rounded border border-yellow-300">
                                <p className="text-sm text-yellow-800">
                                  <strong>📝 Nota:</strong> {booking.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 md:mt-0 md:ml-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-700">
                              {index + 1}
                            </div>
                            <div className="text-xs text-gray-500">de {bookings.length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones */}
          
        </div>
      )}
    </div>
  );
} 