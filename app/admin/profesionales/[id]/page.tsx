"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, User, Mail, Award, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
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
  updatedAt?: string;
}

export default function VerProfesionalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isSignedIn, user, isDraAnaFelicidad } = useAuth();
  const router = useRouter();
  const [professional, setProfessional] = useState<Professional | null>(null);
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

    fetchProfessional();
  }, [isSignedIn, isDraAnaFelicidad, router, resolvedParams.id]);

  const fetchProfessional = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/professionals/${resolvedParams.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Profesional no encontrado",
            description: "El profesional que buscas no existe.",
            variant: "destructive",
          });
          router.push("/admin/profesionales");
          return;
        }
        throw new Error("Error al cargar el profesional");
      }

      const data = await response.json();
      setProfessional(data.professional);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el profesional.",
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
      "bg-cyan-100 text-cyan-800",
      "bg-yellow-100 text-yellow-800",
      "bg-indigo-100 text-indigo-800"
    ];
    return colors[index % colors.length];
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

  if (!professional) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profesional no encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              El profesional que buscas no existe o ha sido eliminado.
            </p>
            <Button asChild>
              <Link href="/admin/profesionales">
                Volver a Profesionales
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
            <Link href="/admin/profesionales">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Profesionales
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {professional.firstName} {professional.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getRoleColor(professional.role)}>
                {getRoleName(professional.role)}
              </Badge>
              {professional.isActive ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactivo
                </Badge>
              )}
            </div>
          </div>
          <Button asChild className="bg-purple-500 hover:bg-purple-600">
            <Link href={`/admin/profesionales/${professional._id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Profesional
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {professional.firstName} {professional.lastName}
                  </h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Mail className="h-4 w-4 mr-2" />
                    {professional.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {professional.professionalData?.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descripción Profesional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {professional.professionalData.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Especialidades</CardTitle>
            </CardHeader>
            <CardContent>
              {professional.professionalData?.specialties && professional.professionalData.specialties.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {professional.professionalData.specialties.map((specialty, index) => (
                    <Badge 
                      key={specialty} 
                      variant="outline" 
                      className={`${getSpecialtyColor(index)} text-sm px-3 py-1`}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No se han definido especialidades para este profesional.
                </p>
              )}
            </CardContent>
          </Card>

          {professional.professionalData?.workingHours && (
            <Card>
              <CardHeader>
                <CardTitle>Horarios de Trabajo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-medium">Inicio:</span>
                    <span className="ml-1">{professional.professionalData.workingHours.start}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-red-600" />
                    <span className="font-medium">Fin:</span>
                    <span className="ml-1">{professional.professionalData.workingHours.end}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Profesional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {professional.professionalData?.experience && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Experiencia:</span>
                  <div className="flex items-center text-sm font-medium">
                    <Award className="h-4 w-4 mr-1 text-orange-600" />
                    {professional.professionalData.experience} años
                  </div>
                </div>
              )}

              {professional.professionalData?.certification && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Certificación:</span>
                  <span className="text-sm font-medium">{professional.professionalData.certification}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <div className="flex items-center">
                  {professional.isActive ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactivo
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Registro:</span>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(professional.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {professional.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Última actualización:</span>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(professional.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/admin/profesionales/${professional._id}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/profesionales">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a Lista
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 