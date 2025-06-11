"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Clock, DollarSign, User2 } from "lucide-react";

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
    professionalData?: {
      specialties: string[];
    };
  }>;
}

export default function ServicesList({
  category,
  subcategory,
}: {
  category: string;
  subcategory?: string;
}) {
  const router = useRouter();
  const { isSignedIn, user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const response = await fetch("/api/services");
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await response.json();
        console.log("API Response:", data); // Para debug

        let filteredServices = data.services.filter(
          (service: Service) => service.category === category
        );

        if (subcategory) {
          filteredServices = filteredServices.filter(
            (service: Service) => service.subcategory === subcategory
          );
        }

        console.log("Filtered services:", filteredServices); // Para debug
        setServices(filteredServices);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description:
            "No se pudieron cargar los servicios. Intente nuevamente más tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [category, subcategory]);

  const handleBookService = (service: Service) => {
    if (!isSignedIn) {
      toast({
        title: "Inicio de sesión requerido",
        description: (
          <div>
            <p>Debes iniciar sesión para reservar este servicio.</p>
            <Link href="/login">
              <Button size="sm" className="mt-2">Iniciar Sesión</Button>
            </Link>
          </div>
        ),
      });
      return;
    }

    setSelectedService(service);
    setDialogOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Por favor seleccione fecha y hora para su reserva.",
        variant: "destructive",
      });
      return;
    }

    try {
      setBookingLoading(true);

      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      dateTime.setHours(hours, minutes);
      
      const userDateTime = new Date(dateTime.toISOString().slice(0, 19));

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          serviceId: selectedService._id,
          date: userDateTime.toISOString(),
          timeSlot: selectedTime,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);

        if (response.status === 401) {
          toast({
            title: "Sesión expirada",
            description:
              "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
          setDialogOpen(false);
          return;
        }

        throw new Error(errorData.error || "Error al crear la reserva");
      }

      const bookingData = await response.json();

      toast({
        title: "Reserva confirmada",
        description: (
          <div>
            <p>Su reserva para {selectedService.name} ha sido confirmada.</p>
            <Button
              className="mt-2 bg-purple-500 hover:bg-purple-600"
              size="sm"
              onClick={() => {
                router.push("/mis-reservas");
              }}
            >
              Ver mis citas
            </Button>
          </div>
        ),
        duration: 5000,
      });

      setDialogOpen(false);
      setSelectedDate(undefined);
      setSelectedTime("");

      router.refresh();
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la reserva. Intente nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  // Función para obtener el horario mínimo (48 horas desde ahora)
  const getMinDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2); // 48 horas = 2 días
    return minDate;
  };

  // Horarios disponibles (esto podría venir del servicio)
  const availableTimeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse" />
              <CardHeader>
                <div className="h-6 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 animate-pulse rounded w-full" />
              </CardFooter>
            </Card>
          ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <User2 className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay servicios disponibles
        </h3>
        <p className="text-gray-600">
          Por el momento no tenemos servicios en esta categoría.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center overflow-hidden">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-purple-600">{service.subcategory}</p>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <p className="text-sm text-gray-600">{service.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration} minutos
                  </div>
                  <div className="flex items-center text-lg font-semibold text-purple-600">
                    <DollarSign className="h-4 w-4" />
                    {service.price.toLocaleString()}
                  </div>
                </div>
                
                {service.professionals && service.professionals.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Profesionales:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.professionals.map((prof) => (
                        <span
                          key={prof._id}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {prof.firstName} {prof.lastName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleBookService(service)}
                className="w-full bg-purple-500 hover:bg-purple-600"
              >
                Reservar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Dialog para reservar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reservar {selectedService?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Seleccione una fecha (mínimo 48 horas de anticipación)</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < getMinDate()}
                className="rounded-md border mt-2"
              />
            </div>

            <div>
              <Label htmlFor="time">Hora</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedService && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Resumen:</p>
                <p className="font-semibold">{selectedService.name}</p>
                <p className="text-sm">Duración: {selectedService.duration} minutos</p>
                <p className="text-sm">Precio: ${selectedService.price.toLocaleString()}</p>
                {selectedDate && selectedTime && (
                  <p className="text-sm text-purple-600 mt-2">
                    Fecha: {selectedDate.toLocaleDateString()} a las {selectedTime}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={!selectedDate || !selectedTime || bookingLoading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {bookingLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando reserva...
                </>
              ) : (
                "Confirmar Reserva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
