"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Eye, Star, Calendar, Award } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  professionalData?: {
    specialties: string[];
    description?: string;
    experience?: number;
    certification?: string;
    workingHours?: {
      start: string;
      end: string;
    };
  };
  createdAt: string;
}

export default function ProfesionalesPage() {
  const { isSignedIn, user, isDraAnaFelicidad } = useAuth();
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
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

    fetchProfessionals();
  }, [isSignedIn, isDraAnaFelicidad, router]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/professionals", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar los profesionales");
      }

      const data = await response.json();
      setProfessionals(data.professionals || []);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesionales.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "dra_ana_felicidad":
        return "bg-purple-100 text-purple-800";
      case "professional":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "dra_ana_felicidad":
        return "Directora Médica";
      case "professional":
        return "Profesional";
      default:
        return "Usuario";
    }
  };

  const getSpecialtyColor = (index: number) => {
    const colors = [
      "bg-green-100 text-green-800",
      "bg-pink-100 text-pink-800",
      "bg-orange-100 text-orange-800",
      "bg-cyan-100 text-cyan-800"
    ];
    return colors[index % colors.length];
  };

  if (!isSignedIn || !isDraAnaFelicidad) {
    return <div>Verificando acceso...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Profesionales</h1>
        <p className="text-gray-600 mt-2">
          Administra el equipo de profesionales del spa
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
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
      ) : professionals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">👩‍⚕️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay profesionales registrados
            </h3>
            <p className="text-gray-600">
              Parece que aún no hay profesionales en el sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => (
              <Card key={professional._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {professional.firstName} {professional.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleColor(professional.role)}>
                          {getRoleName(professional.role)}
                        </Badge>
                        {!professional.isActive && (
                          <Badge variant="destructive">Inactivo</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">{professional.email}</p>
                  </div>

                  {professional.professionalData?.specialties && professional.professionalData.specialties.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                      <div className="flex flex-wrap gap-1">
                        {professional.professionalData.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge 
                            key={specialty} 
                            variant="outline" 
                            className={`text-xs ${getSpecialtyColor(index)}`}
                          >
                            {specialty}
                          </Badge>
                        ))}
                        {professional.professionalData.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                            +{professional.professionalData.specialties.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {professional.professionalData?.experience && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="h-4 w-4 mr-1" />
                      {professional.professionalData.experience} años de experiencia
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Desde {new Date(professional.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/admin/profesionales/${professional._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Perfil
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/admin/profesionales/${professional._id}/editar`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Link>
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
                <CardTitle>Estadísticas del Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{professionals.length}</div>
                    <div className="text-sm text-blue-700">Total Profesionales</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {professionals.filter(p => p.isActive).length}
                    </div>
                    <div className="text-sm text-green-700">Activos</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {new Set(professionals.flatMap(p => p.professionalData?.specialties || [])).size}
                    </div>
                    <div className="text-sm text-purple-700">Especialidades</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(professionals.filter(p => p.professionalData?.experience).reduce((sum, p) => sum + (p.professionalData?.experience || 0), 0) / professionals.filter(p => p.professionalData?.experience).length) || 0}
                    </div>
                    <div className="text-sm text-orange-700">Años Promedio</div>
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