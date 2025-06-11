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
import { ArrowLeft, Save } from "lucide-react";
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
  isActive: boolean;
  image?: string;
}

export default function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isSignedIn, user, isDraAnaFelicidad } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    duration: "",
    isActive: true,
    image: "",
    professionals: [] as string[],
  });

  const [availableProfessionals, setAvailableProfessionals] = useState<Array<{
    _id: string;
    firstName: string;
    lastName: string;
    professionalData?: {
      specialties: string[];
    };
  }>>([]);

  const categories = [
    "Masajes",
    "Belleza", 
    "Tratamientos Faciales",
    "Tratamientos Corporales",
    "Servicios Grupales"
  ];

  const subcategoriesByCategory = {
    "Masajes": ["Relajante", "Terapéutico", "Deportivo", "Descontracturante"],
    "Belleza": ["Facial", "Corporal", "Manos y Pies", "Depilación"],
    "Tratamientos Faciales": ["Anti-edad", "Hidratación", "Limpieza", "Rejuvenecimiento"],
    "Tratamientos Corporales": ["Reductivo", "Reafirmante", "Drenaje", "Relajante"],
    "Servicios Grupales": ["Wellness", "Relajación", "Terapéutico", "Recreativo"]
  };

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
    fetchProfessionals();
  }, [isSignedIn, isDraAnaFelicidad, router, resolvedParams.id]);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch("/api/professionals", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableProfessionals(data.professionals || []);
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
    }
  };

  const fetchService = async () => {
    try {
      setInitialLoading(true);
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
      const service = data.service;
      
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        subcategory: service.subcategory,
        price: service.price.toString(),
        duration: service.duration.toString(),
        isActive: service.isActive,
        image: service.image || "",
        professionals: service.professionals?.map((p: any) => p._id) || [],
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el servicio.",
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const updateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || formData.category,
        price: parseInt(formData.price),
        duration: parseInt(formData.duration),
        isActive: formData.isActive,
        image: formData.image,
        professionals: formData.professionals,
      };

      const response = await fetch(`/api/services/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el servicio");
      }

      toast({
        title: "Servicio actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });

      router.push(`/admin/servicios/${resolvedParams.id}`);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el servicio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProfessional = (professionalId: string) => {
    setFormData(prev => ({
      ...prev,
      professionals: prev.professionals.includes(professionalId)
        ? prev.professionals.filter(id => id !== professionalId)
        : [...prev.professionals, professionalId]
    }));
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
              {Array(6).fill(0).map((_, i) => (
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
            <Link href={`/admin/servicios/${resolvedParams.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Servicio</h1>
            <p className="text-gray-600 mt-2">
              Modifica la información del servicio
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Servicio *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Masaje Relajante con Aceites Esenciales"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe los beneficios y características del servicio..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagen del Servicio</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Vista previa"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategoría</Label>
                <Select 
                  value={formData.subcategory} 
                  onValueChange={(value) => handleInputChange("subcategory", value)}
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.category && subcategoriesByCategory[formData.category as keyof typeof subcategoriesByCategory]?.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (pesos) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="5000"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="60"
                  min="15"
                  max="300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profesionales Asignados</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                {availableProfessionals.length === 0 ? (
                  <p className="text-sm text-gray-500">Cargando profesionales...</p>
                ) : (
                  <div className="space-y-2">
                    {availableProfessionals.map((professional) => (
                      <div key={professional._id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`prof-${professional._id}`}
                          checked={formData.professionals.includes(professional._id)}
                          onChange={() => toggleProfessional(professional._id)}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`prof-${professional._id}`}
                          className="flex-1 text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          {professional.firstName} {professional.lastName}
                          {professional.professionalData?.specialties && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({professional.professionalData.specialties.slice(0, 2).join(", ")})
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Selecciona los profesionales que pueden realizar este servicio
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Estado del Servicio</Label>
              <Select 
                value={formData.isActive ? "active" : "inactive"} 
                onValueChange={(value) => handleInputChange("isActive", value === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                <Link href={`/admin/servicios/${resolvedParams.id}`}>
                  Cancelar
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      
    </div>
  );
} 