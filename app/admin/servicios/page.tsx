"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Clock, DollarSign, Users } from "lucide-react";
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
  professionals: Array<{
    _id: string;
    firstName: string;
    lastName: string;
  }>;
  createdAt: string;
}

export default function GestionServiciosPage() {
  const { isSignedIn, user, isDraAnaFelicidad } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
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

    fetchServices();
  }, [isSignedIn, isDraAnaFelicidad, router]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar los servicios");
      }

      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!confirm("¿Estás segura de que quieres eliminar este servicio?")) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el servicio");
      }

      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado exitosamente.",
      });

      fetchServices();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio.",
        variant: "destructive",
      });
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

  if (!isSignedIn || !isDraAnaFelicidad) {
    return <div>Verificando acceso...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Servicios</h1>
            <p className="text-gray-600 mt-2">
              Administra el catálogo completo de servicios del spa
            </p>
          </div>
          <Button asChild className="bg-green-500 hover:bg-green-600">
            <Link href="/admin/servicios/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🧘‍♀️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay servicios registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando el primer servicio al catálogo del spa.
            </p>
            <Button asChild className="bg-purple-500 hover:bg-purple-600">
              <Link href="/admin/servicios/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Servicio
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service._id} className="hover:shadow-lg transition-shadow">
                {service.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} min
                    </div>
                    <div className="flex items-center text-lg font-semibold text-purple-600">
                      <DollarSign className="h-4 w-4" />
                      {service.price.toLocaleString()}
                    </div>
                  </div>

                  {service.subcategory && (
                    <div>
                      <p className="text-xs text-gray-500">Subcategoría: {service.subcategory}</p>
                    </div>
                  )}

                  {service.professionals && service.professionals.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Profesionales ({service.professionals.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {service.professionals.slice(0, 2).map((prof) => (
                          <span
                            key={prof._id}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {prof.firstName} {prof.lastName}
                          </span>
                        ))}
                        {service.professionals.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{service.professionals.length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/admin/servicios/${service._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/admin/servicios/${service._id}/editar`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteService(service._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estadísticas */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas del Catálogo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{services.length}</div>
                    <div className="text-sm text-blue-700">Total Servicios</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(services.map(s => s.category)).size}
                    </div>
                    <div className="text-sm text-green-700">Categorías</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ${Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length).toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-700">Precio Promedio</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(services.reduce((sum, s) => sum + s.duration, 0) / services.length)}
                    </div>
                    <div className="text-sm text-orange-700">Duración Promedio (min)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
} 