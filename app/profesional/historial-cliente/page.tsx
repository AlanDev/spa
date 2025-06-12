"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Search, User, Calendar, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Client {
  userId: string;
  userName: string;
  totalBookings: number;
  completedBookings: number;
  lastVisit: string | null;
  totalSpent: number;
}

export default function HistorialClientesPage() {
  const { user, isProfesional } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isProfesional && user) {
      fetchClients();
    }
  }, [isProfesional, user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/professional/clients');
      const data = await response.json();
      
      if (response.ok) {
        setClients(data.clients || []);
        setFilteredClients(data.clients || []);
      } else {
        console.error('Error fetching clients:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (!isProfesional) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">Esta página es solo para profesionales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Historial de Clientes</h1>
        <p className="text-gray-600 mt-2">
          Busca y consulta el historial de tratamientos de tus clientes
        </p>
      </div>

      {/* Barra de búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar cliente por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando clientes...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No se encontraron clientes que coincidan con "${searchTerm}"`
                : 'Aún no tienes clientes con historial de tratamientos.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <Card key={client.userId} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {client.userName}
                      </h3>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Citas</span>
                      </div>
                      <div className="font-semibold">
                        {client.totalBookings} total
                      </div>
                      <div className="text-green-600 text-xs">
                        {client.completedBookings} completadas
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>Gasto</span>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(client.totalSpent)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-600 mb-2">
                      Última visita: {formatDate(client.lastVisit)}
                    </div>
                    
                    <Button
                      asChild
                      className="w-full"
                      size="sm"
                    >
                      <Link href={`/profesional/historial-cliente/${client.userId}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Historial Completo
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estadísticas generales */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Estadísticas Generales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredClients.length}
                  </div>
                  <div className="text-sm text-purple-700">
                    Clientes {searchTerm ? 'Encontrados' : 'Totales'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredClients.reduce((sum, c) => sum + c.totalBookings, 0)}
                  </div>
                  <div className="text-sm text-blue-700">Total Citas</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredClients.reduce((sum, c) => sum + c.completedBookings, 0)}
                  </div>
                  <div className="text-sm text-green-700">Citas Completadas</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(filteredClients.reduce((sum, c) => sum + c.totalSpent, 0))}
                  </div>
                  <div className="text-sm text-orange-700">Ingresos Totales</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 