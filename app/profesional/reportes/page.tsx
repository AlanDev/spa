"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, CalendarRange, FileText, Download, Filter, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PrintBookings from "@/components/print-bookings";

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

export default function ReportesPage() {
  const { user, isProfesional } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [reportType, setReportType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  
  // Fechas por defecto: último mes
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const today = new Date().toISOString().split('T')[0];
  const lastMonthStr = lastMonth.toISOString().split('T')[0];
  
  const [startDate, setStartDate] = useState(lastMonthStr);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    if (isProfesional && user) {
      fetchBookings();
    }
  }, [isProfesional, user, startDate, endDate]);

  useEffect(() => {
    applyFilters();
  }, [bookings, reportType, statusFilter, paymentFilter]);

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

  const applyFilters = () => {
    let filtered = [...bookings];

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filtro por estado de pago
    if (paymentFilter !== "all") {
      filtered = filtered.filter(booking => 
        paymentFilter === "paid" ? booking.payment.paid : !booking.payment.paid
      );
    }

    setFilteredBookings(filtered);
  };

  const setQuickRange = (days: number, type: 'past' | 'future' = 'past') => {
    const today = new Date();
    let start, end;

    if (type === 'past') {
      start = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
      end = today;
    } else {
      start = today;
      end = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getStats = () => {
    const totalBookings = filteredBookings.length;
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.payment.amount, 0);
    const paidBookings = filteredBookings.filter(b => b.payment.paid).length;
    const completedBookings = filteredBookings.filter(b => b.status === 'completed').length;
    
    return {
      totalBookings,
      totalRevenue,
      paidBookings,
      completedBookings,
      averageRevenue: totalBookings > 0 ? totalRevenue / totalBookings : 0
    };
  };

  if (!isProfesional) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso restringido</h3>
            <p className="text-gray-600">Esta página es solo para profesionales.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes de Turnos</h1>
          <p className="text-gray-600 mt-2">
            Genera reportes detallados de tus turnos y citas
          </p>
        </div>
      </div>

      {/* Controles de filtro */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Rango de fechas */}
            <div className="space-y-2">
              <Label>Fecha inicio</Label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha fin</Label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por estado */}
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="confirmed">Confirmadas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="cancelled">Canceladas</SelectItem>
                  <SelectItem value="rescheduled">Reprogramadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por pago */}
            <div className="space-y-2">
              <Label>Estado de Pago</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los pagos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  <SelectItem value="paid">Pagadas</SelectItem>
                  <SelectItem value="unpaid">Pendientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botones de rango rápido */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange(7)}
            >
              Últimos 7 días
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange(30)}
            >
              Último mes
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange(90)}
            >
              Últimos 3 meses
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setQuickRange(365)}
            >
              Último año
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estadísticas del Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Turnos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completedBookings}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.paidBookings}</div>
              <div className="text-sm text-gray-600">Pagados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</div>
              <div className="text-sm text-gray-600">Ingresos Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{formatCurrency(stats.averageRevenue)}</div>
              <div className="text-sm text-gray-600">Promedio por Turno</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {filteredBookings.length > 0 ? (
              <PrintBookings 
                bookings={filteredBookings}
                professionalName={`${user?.firstName} ${user?.lastName}`}
                startDate={startDate}
                endDate={endDate}
              />
            ) : (
              <Button disabled variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Sin datos para imprimir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vista previa de datos */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Cargando datos...</p>
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay datos con los filtros aplicados</h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros o el rango de fechas
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa - {filteredBookings.length} turnos encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredBookings.slice(0, 10).map((booking) => (
                <div key={booking._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{booking.userName}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {new Date(booking.date).toLocaleDateString('es-ES')} - {booking.timeSlot}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(booking.payment.amount)}</div>
                    <div className="text-xs text-gray-500">{booking.status}</div>
                  </div>
                </div>
              ))}
              {filteredBookings.length > 10 && (
                <div className="text-center text-sm text-gray-500 pt-2">
                  ... y {filteredBookings.length - 10} turnos más
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 