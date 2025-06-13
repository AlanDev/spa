"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TomorrowBooking {
  _id: string;
  userName: string;
  services: Array<{
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
  }>;
  timeSlot: string;
  status: "confirmed" | "cancelled" | "rescheduled" | "completed";
  payment: {
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
    day: 'numeric',
    month: 'long'
  });

  useEffect(() => {
    if (isProfesional && user?.id) {
      fetchTomorrowBookings();
    }
  }, [isProfesional, user]);

  const fetchTomorrowBookings = async () => {
    try {
      if (!user?.id) return;
      
      const response = await fetch(`/api/professional/bookings?professionalId=${user.id}&startDate=${tomorrowDate}&endDate=${tomorrowDate}`);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getTotalDuration = (services: TomorrowBooking['services']) => {
    return services.reduce((total, service) => total + service.serviceDuration, 0);
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Turnos de Mañana</h1>
        <p className="text-gray-600">
          Tus citas para <span className="font-semibold text-purple-600">{tomorrowFormatted}</span>
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay turnos para mañana</h3>
            <p className="text-gray-600">¡Día libre! 🌟</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Resumen simple */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">{bookings.length}</div>
                  <div className="text-sm text-gray-600">Turnos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {bookings.reduce((total, b) => total + getTotalDuration(b.services), 0)} min
                  </div>
                  <div className="text-sm text-gray-600">Tiempo Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(bookings.reduce((total, b) => total + b.payment.amount, 0))}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista simple de turnos */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                  .map((booking) => (
                    <div key={booking._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-600" />
                          <span className="font-bold text-xl">{booking.timeSlot}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {getTotalDuration(booking.services)} min
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{booking.userName}</span>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        {booking.services.map(s => s.serviceName).join(', ')}
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-green-600">
                          {formatCurrency(booking.payment.amount)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.payment.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.payment.paid ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>

                      {booking.notes && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                          <strong>Nota:</strong> {booking.notes}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 