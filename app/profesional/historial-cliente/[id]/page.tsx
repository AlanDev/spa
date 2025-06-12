"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Star,
  TrendingUp,
  FileText,
  ArrowLeft,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
  treatmentNotes?: {
    notes: string;
    addedAt: string;
    addedByName: string;
  };
}

interface ClientStats {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  favoriteServices: Array<{
    service: string;
    count: number;
  }>;
  lastVisit: string | null;
}

interface ClientInfo {
  userId: string;
  userName: string;
}

export default function HistorialClientePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isProfesional } = useAuth();
  const [clientHistory, setClientHistory] = useState<Booking[]>([]);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);

  const clientId = params.id as string;

  useEffect(() => {
    if (isProfesional && user && clientId) {
      fetchClientHistory();
    }
  }, [isProfesional, user, clientId]);

  const fetchClientHistory = async () => {
    try {
      const response = await fetch(`/api/professional/client-history/${clientId}`);
      const data = await response.json();
      
      if (response.ok) {
        setClientHistory(data.clientHistory || []);
        setClientInfo(data.clientInfo);
        setStats(data.stats);
      } else {
        console.error('Error fetching client history:', data.error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Historial de {clientInfo?.userName || 'Cliente'}
          </h1>
          <p className="text-gray-600 mt-2">
            Histórico completo de servicios y tratamientos
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando historial...</p>
        </div>
      ) : !clientInfo ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cliente no encontrado
            </h3>
            <p className="text-gray-600">
              No se encontró información del cliente solicitado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Estadísticas del Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Citas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Gastado</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats?.totalSpent || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Última Visita</p>
                    <p className="text-sm font-bold text-gray-900">
                      {stats?.lastVisit 
                        ? new Date(stats.lastVisit).toLocaleDateString('es-ES')
                        : 'Nunca'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Servicios Favoritos */}
          {stats?.favoriteServices && stats.favoriteServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Servicios Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.favoriteServices.map((item, index) => (
                    <div key={item.service} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                        <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.service}</p>
                        <p className="text-sm text-gray-600">{item.count} veces</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de Citas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historial de Citas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hay historial de citas para este cliente.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {clientHistory.map((booking) => (
                    <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold">
                                {formatDate(booking.date)} - {booking.timeSlot}
                              </span>
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
                            {booking.services.map((service, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
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

                          {booking.notes && (
                            <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                              <p className="text-sm text-blue-800">
                                <strong>Nota inicial:</strong> {booking.notes}
                              </p>
                            </div>
                          )}

                          {booking.treatmentNotes && (
                            <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                              <div className="flex items-center gap-2 mb-2">
                                <Award className="h-4 w-4 text-green-600" />
                                <strong className="text-green-800">Notas del Tratamiento:</strong>
                              </div>
                              <p className="text-sm text-green-800 mb-2">
                                {booking.treatmentNotes.notes}
                              </p>
                              <p className="text-xs text-green-600">
                                Agregado por {booking.treatmentNotes.addedByName} - {formatDateTime(booking.treatmentNotes.addedAt)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 text-right">
                          <div className="text-lg font-bold text-gray-700">
                            Total: {formatCurrency(booking.payment.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.payment.paid ? '✅ Pagado' : '⏳ Pendiente'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 