"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, DollarSign, Users, Calendar, TrendingUp, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SimpleReportData {
  today: {
    appointments: number;
    revenue: number;
  };
  thisWeek: {
    appointments: number;
    revenue: number;
  };
  thisMonth: {
    appointments: number;
    revenue: number;
  };
  topServices: Array<{
    name: string;
    count: number;
  }>;
  topProfessionals: Array<{
    name: string;
    bookings: number;
  }>;
}

export default function ReportesSimplePage() {
  const { isSignedIn, user, isDraAnaFelicidad, loading } = useAuth();
  const router = useRouter();
  const [reportData, setReportData] = useState<SimpleReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    console.log("🔍 ADMIN-REPORTES: useEffect triggered");
    console.log("🔍 ADMIN-REPORTES: loading:", loading);
    console.log("🔍 ADMIN-REPORTES: isSignedIn:", isSignedIn);
    console.log("🔍 ADMIN-REPORTES: isDraAnaFelicidad:", isDraAnaFelicidad);
    
    if (!loading && !isSignedIn) {
      console.log("❌ ADMIN-REPORTES: Redirecting to login - not signed in");
      router.push("/login");
      return;
    }

    if (!loading && isSignedIn && !isDraAnaFelicidad) {
      console.log("❌ ADMIN-REPORTES: Redirecting to home - no permissions");
      toast({
        title: "Acceso denegado",
        description: "Solo la Dra. Ana Felicidad puede acceder a esta página.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    if (!loading && isSignedIn && isDraAnaFelicidad) {
      console.log("✅ ADMIN-REPORTES: Access granted, fetching report");
      fetchSimpleReport();
    }
  }, [isSignedIn, isDraAnaFelicidad, loading, router]);

  const fetchSimpleReport = async () => {
    try {
      setReportLoading(true);
      
      console.log("🔍 ADMIN-REPORTES: Fetching real data from API");
      
      // Llamar al endpoint real con cache busting
      const cacheBuster = Date.now();
      const response = await fetch(`/api/reports/summary?_=${cacheBuster}`, {
        credentials: "include",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      });

      console.log("🔍 ADMIN-REPORTES: API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        console.log("❌ ADMIN-REPORTES: API error:", errorData);
        throw new Error(errorData.error || `Error del servidor (${response.status})`);
      }

      const data = await response.json();
      console.log("✅ ADMIN-REPORTES: Real data received:", data.summary);
      
      setReportData(data.summary);
    } catch (error) {
      console.error("❌ ADMIN-REPORTES: Error fetching data:", error);
      
      // Si falla la API, usar datos de fallback
      console.log("🔧 ADMIN-REPORTES: Using fallback data");
      const fallbackData: SimpleReportData = {
        today: {
          appointments: 0,
          revenue: 0,
        },
        thisWeek: {
          appointments: 0,
          revenue: 0,
        },
        thisMonth: {
          appointments: 0,
          revenue: 0,
        },
        topServices: [
          { name: "No hay datos disponibles", count: 0 }
        ],
        topProfessionals: [
          { name: "No hay datos disponibles", bookings: 0 }
        ]
      };
      
      setReportData(fallbackData);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar los reportes reales. Mostrando datos de respaldo.",
        variant: "destructive",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const viewDailyReport = () => {
    router.push(`/reportes/diarios?date=${selectedDate}`);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated or not authorized
  if (!isSignedIn || !isDraAnaFelicidad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">No tienes acceso a esta página.</p>
        </div>
      </div>
    );
  }

  if (reportLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mt-2 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-gray-600">
              Los reportes estarán disponibles cuando haya datos suficientes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reportes del Spa</h1>
        <p className="text-gray-600 mt-2">
          Resumen rápido del rendimiento del spa
        </p>
      </div>

      {/* Métricas principales - Simple y clara */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Hoy</p>
                <p className="text-2xl font-bold text-blue-900">{reportData.today.appointments} citas</p>
                <p className="text-sm text-blue-600">${reportData.today.revenue.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Esta Semana</p>
                <p className="text-2xl font-bold text-green-900">{reportData.thisWeek.appointments} citas</p>
                <p className="text-sm text-green-600">${reportData.thisWeek.revenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Este Mes</p>
                <p className="text-2xl font-bold text-purple-900">{reportData.thisMonth.appointments} citas</p>
                <p className="text-sm text-purple-600">${reportData.thisMonth.revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Servicios populares - Simplificado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Servicios Más Solicitados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm font-medium">
                    {service.count} veces
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profesionales top - Simplificado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Profesionales Destacados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.topProfessionals.map((prof, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-sm">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-900">{prof.name}</span>
                  </div>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                    {prof.bookings} citas
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ver Reporte Detallado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 max-w-sm">
              <Label htmlFor="date">Seleccionar fecha específica</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={viewDailyReport} className="bg-purple-600 hover:bg-purple-700">
              Ver Reporte del Día
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 