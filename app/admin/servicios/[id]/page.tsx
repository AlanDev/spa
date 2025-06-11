"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Clock, DollarSign, Users, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  duration: number;
  image?: string;
  isActive: boolean;
  professionals: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    professionalData?: {
      specialties: string[];
    };
  }>;
  availableTimeSlots: string[];
  availableDays: number[];
  createdAt: string;
  updatedAt?: string;
}

export default function VerServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isSignedIn, user, isDraAnaFelicidad } = useAuth();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }

    if (!isDraAnaFelicidad) {
      toast({
        title: "Acceso denegado",
        description: "Solo la Dra. Ana Felicidad puede acceder a esta página.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    fetchService();
  }, [isSignedIn, isDraAnaFelicidad, router, resolvedParams.id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/services/${resolvedParams.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Servicio no encontrado",
            description: "El servicio que buscas no existe.",
            variant: "destructive",
          });
          router.push("/admin/servicios");
          return;
        }
        throw new Error("Error al cargar el servicio");
      }

      const data = await response.json();
      setService(data.service);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el servicio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Masajes":
        return "bg-green-100 text-green-800";
      case "Belleza":
        return "bg-pink-100 text-pink-800";
      case "Tratamientos Faciales":
        return "bg-blue-100 text-blue-800";
      case "Tratamientos Corporales":
        return "bg-purple-100 text-purple-800";
      case "Servicios Grupales":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDayName = (day: number) => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[day];
  };

  if (!isSignedIn || !isDraAnaFelicidad) {
    return <div>Verificando acceso...</div>;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Servicio no encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              El servicio que buscas no existe o ha sido eliminado.
            </p>
            <Button asChild>
              <Link href="/admin/servicios">
                Volver a Servicios
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link href="/admin/servicios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Servicios
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(service.category)}`}>
                {service.category}
              </span>
              {!service.isActive && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Inactivo
                </span>
              )}
            </div>
          </div>
          <Button asChild className="bg-purple-500 hover:bg-purple-600">
            <Link href={`/admin/servicios/${service._id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Servicio
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{service.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profesionales Asignados</CardTitle>
            </CardHeader>
            <CardContent>
              {service.professionals && service.professionals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.professionals.map((prof) => (
                    <div key={prof._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {prof.firstName} {prof.lastName}
                        </p>
                        {prof.professionalData?.specialties && (
                          <p className="text-sm text-gray-600">
                            {prof.professionalData.specialties.slice(0, 2).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No hay profesionales asignados a este servicio.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horarios Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Días de la semana:</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.availableDays?.map((day) => (
                      <span key={day} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {getDayName(day)}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Horarios:</h4>
                  <div className="flex flex-wrap gap-2">
                    {service.availableTimeSlots?.map((time) => (
                      <span key={time} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {service.image && (
            <Card>
              <CardHeader>
                <CardTitle>Imagen del Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Información del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Precio:</span>
                <div className="flex items-center text-lg font-semibold text-purple-600">
                  <DollarSign className="h-4 w-4" />
                  {service.price.toLocaleString()}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duración:</span>
                <div className="flex items-center text-sm font-medium">
                  <Clock className="h-4 w-4 mr-1" />
                  {service.duration} minutos
                </div>
              </div>

              {service.subcategory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subcategoría:</span>
                  <span className="text-sm font-medium">{service.subcategory}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Creado:</span>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(service.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {service.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Última actualización:</span>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(service.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 