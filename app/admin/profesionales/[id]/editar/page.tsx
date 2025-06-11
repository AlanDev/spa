"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
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
}

export default function EditarProfesionalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isSignedIn, user, isDraAnaFelicidad } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    isActive: true,
    description: "",
    experience: "",
    certification: "",
    workingHoursStart: "",
    workingHoursEnd: "",
    specialties: [] as string[],
  });

  const [newSpecialty, setNewSpecialty] = useState("");

  const availableSpecialties = [
    "Masajes terapéuticos",
    "Masajes relajantes",
    "Masajes deportivos",
    "Tratamientos faciales",
    "Tratamientos corporales",
    "Belleza y estética",
    "Depilación",
    "Manicura y pedicura",
    "Aromaterapia",
    "Reflexología",
    "Drenaje linfático",
    "Yoga",
    "Meditación",
    "Wellness",
    "Spa terapéutico"
  ];

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
      setInitialLoading(true);
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
      const professional = data.professional;
      
      setFormData({
        firstName: professional.firstName || "",
        lastName: professional.lastName || "",
        email: professional.email || "",
        isActive: professional.isActive !== false,
        description: professional.professionalData?.description || "",
        experience: professional.professionalData?.experience?.toString() || "",
        certification: professional.professionalData?.certification || "",
        workingHoursStart: professional.professionalData?.workingHours?.start || "",
        workingHoursEnd: professional.professionalData?.workingHours?.end || "",
        specialties: professional.professionalData?.specialties || [],
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el profesional.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Error",
        description: "Por favor completa los campos obligatorios (nombre, apellido y email).",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        isActive: formData.isActive,
        professionalData: {
          specialties: formData.specialties,
          description: formData.description || undefined,
          experience: formData.experience ? parseInt(formData.experience) : undefined,
          certification: formData.certification || undefined,
          workingHours: (formData.workingHoursStart && formData.workingHoursEnd) ? {
            start: formData.workingHoursStart,
            end: formData.workingHoursEnd
          } : undefined,
        },
      };

      const response = await fetch(`/api/professionals/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el profesional");
      }

      toast({
        title: "Profesional actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });

      router.push(`/admin/profesionales/${resolvedParams.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el profesional.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn || !isDraAnaFelicidad) {
    return <div>Verificando acceso...</div>;
  }

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-96 mb-8"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link href={`/admin/profesionales/${resolvedParams.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Profesional</h1>
            <p className="text-gray-600 mt-2">
              Modifica la información del profesional
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Nombre del profesional"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Apellido del profesional"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@ejemplo.com"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked as boolean)}
              />
              <Label htmlFor="isActive">Profesional activo</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Profesional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción Profesional</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe la experiencia y enfoque profesional..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Años de Experiencia</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  placeholder="5"
                  min="0"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certification">Certificación</Label>
                <Input
                  id="certification"
                  value={formData.certification}
                  onChange={(e) => handleInputChange("certification", e.target.value)}
                  placeholder="Ej: Certificado en Masajes Terapéuticos"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingHoursStart">Hora de Inicio</Label>
                <Input
                  id="workingHoursStart"
                  type="time"
                  value={formData.workingHoursStart}
                  onChange={(e) => handleInputChange("workingHoursStart", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHoursEnd">Hora de Fin</Label>
                <Input
                  id="workingHoursEnd"
                  type="time"
                  value={formData.workingHoursEnd}
                  onChange={(e) => handleInputChange("workingHoursEnd", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Especialidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Agregar Especialidad</Label>
              <div className="flex gap-2">
                <Select value={newSpecialty} onValueChange={setNewSpecialty}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecialties
                      .filter(specialty => !formData.specialties.includes(specialty))
                      .map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => addSpecialty(newSpecialty)}
                  disabled={!newSpecialty}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {formData.specialties.length > 0 && (
              <div>
                <Label>Especialidades Asignadas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.specialties.map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{specialty}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600">
            {loading ? (
              <>Guardando...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/admin/profesionales/${resolvedParams.id}`}>
              Cancelar
            </Link>
          </Button>
        </div>
      </form>

      
    </div>
  );
} 