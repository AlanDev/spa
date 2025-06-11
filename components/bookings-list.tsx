"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarIcon, Clock } from "lucide-react";

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
    subcategory: string;
  };
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  serviceCategory: string;
  serviceSubcategory: string;
  date: string;
  status: "confirmed" | "cancelled" | "rescheduled";
  originalDate?: string;
  createdAt: string;
}

export default function BookingsList() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/bookings", {
          credentials: "same-origin",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        
        // Asegurar que bookings sea siempre un array
        if (data && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else if (Array.isArray(data)) {
          setBookings(data);
        } else {
          console.warn("Formato de datos inesperado:", data);
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]); // Asegurar que sea un array vacío en caso de error
        toast({
          title: "Error",
          description:
            "No se pudieron cargar las reservas. Intente nuevamente más tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedDate(undefined);
    setSelectedTime("");
    setRescheduleDialogOpen(true);
  };

  const handleCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const confirmReschedule = async () => {
    if (!selectedBooking || !selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description:
          "Por favor seleccione fecha y hora para reprogramar su reserva.",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);

      // Combine date and time
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      dateTime.setHours(hours, minutes);
      
      // Crear una fecha que mantenga la hora seleccionada por el usuario
      const userDateTime = new Date(dateTime.toISOString().slice(0, 19));

      const response = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rescheduled",
          date: userDateTime.toISOString(),
        }),
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error al reprogramar:", errorData);
        throw new Error("No se pudo reprogramar la reserva");
      }

      // Mostrar notificación de éxito
      const serviceName =
        selectedBooking.serviceName || selectedBooking.serviceId.name;
      const formattedDate = format(userDateTime, "EEEE d 'de' MMMM 'de' yyyy", {
        locale: es,
      });
      const formattedTime = format(userDateTime, "HH:mm");

      toast({
        title: "Reserva reprogramada",
        description: `Su reserva para ${serviceName} ha sido reprogramada para el ${formattedDate} a las ${formattedTime}.`,
      });

      setRescheduleDialogOpen(false);

      // Update bookings list - asegurar que bookings sea un array
      const updatedBooking = await response.json();
      const currentBookings = Array.isArray(bookings) ? bookings : [];
      setBookings(
        currentBookings.map((booking) =>
          booking._id === updatedBooking._id ? updatedBooking : booking
        )
      );

      // Refresh page to ensure consistent data
      router.refresh();
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      toast({
        title: "Error",
        description:
          "No se pudo reprogramar la reserva. Intente nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);

      const response = await fetch(`/api/bookings/${selectedBooking._id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error al cancelar:", errorData);
        throw new Error("No se pudo cancelar la reserva");
      }

      // Mostrar notificación de éxito
      toast({
        title: "Reserva cancelada",
        description: `La reserva para ${
          selectedBooking.serviceName || selectedBooking.serviceId.name
        } ha sido cancelada exitosamente.`,
      });

      setCancelDialogOpen(false);

      // Update bookings list - mark as cancelled, asegurar que bookings sea un array
      const currentBookings = Array.isArray(bookings) ? bookings : [];
      setBookings(
        currentBookings.map((booking) =>
          booking._id === selectedBooking._id
            ? { ...booking, status: "cancelled" as const }
            : booking
        )
      );

      // Refresh page to ensure consistent data
      router.refresh();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description:
          "No se pudo cancelar la reserva. Intente nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No tienes reservas activas.</p>
        <Button
          onClick={() => router.push("/servicios")}
          className="bg-purple-500 hover:bg-purple-600"
        >
          Reservar un servicio
        </Button>
      </div>
    );
  }

  // Asegurar que bookings sea un array antes de usar spread operator
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  
  // Generate time slots from 9:00 to 18:00
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 18) {
      timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }

  // Sort bookings by date (most recent first)
  const sortedBookings = [...safeBookings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className="space-y-4">
        {sortedBookings.map((booking) => {
          const bookingDate = new Date(booking.date);
          const isPast = bookingDate < new Date();

          return (
            <Card key={booking._id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">
                      {booking.serviceName || booking.serviceId.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {format(
                          new Date(booking.date),
                          "EEEE d 'de' MMMM 'de' yyyy",
                          { locale: es }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(booking.date), "HH:mm")}</span>
                    </div>

                    {/* Información adicional del servicio */}
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="font-medium">Categoría:</span>{" "}
                        <span className="capitalize">
                          {booking.serviceCategory ||
                            booking.serviceId.category}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span>{" "}
                        <span className="capitalize">
                          {booking.serviceSubcategory ||
                            booking.serviceId.subcategory}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Precio:</span> $
                        {booking.servicePrice || booking.serviceId.price}
                      </div>
                      <div>
                        <span className="font-medium">Duración:</span>{" "}
                        {booking.serviceDuration || booking.serviceId.duration}{" "}
                        min
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <Badge
                      className={
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : booking.status === "rescheduled"
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {booking.status === "confirmed"
                        ? "Confirmada"
                        : booking.status === "rescheduled"
                        ? "Reprogramada"
                        : "Cancelada"}
                    </Badge>

                    {booking.status === "rescheduled" &&
                      booking.originalDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Fecha original:{" "}
                          {format(
                            new Date(booking.originalDate),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </p>
                      )}

                    {booking.status !== "cancelled" && !isPast && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReschedule(booking)}
                          className="border-purple-500 text-purple-500 hover:bg-purple-50"
                        >
                          Reprogramar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(booking)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reprogramar Reserva</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Servicio</Label>
              <p className="font-medium">
                {selectedBooking?.serviceName ||
                  selectedBooking?.serviceId.name}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Nueva Fecha</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Nueva Hora</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmReschedule}
              disabled={!selectedDate || !selectedTime || actionLoading}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              ¿Está seguro que desea cancelar su reserva para{" "}
              {selectedBooking?.serviceName || selectedBooking?.serviceId.name}?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={actionLoading}
            >
              Volver
            </Button>
            <Button
              onClick={confirmCancel}
              disabled={actionLoading}
              variant="destructive"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Cancelar Reserva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
