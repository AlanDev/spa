"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Calendar, Users, BarChart3, Settings, FileText, HelpCircle, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { 
    isSignedIn, 
    user,
    loading,
    isCliente, 
    isProfesional, 
    isDraAnaFelicidad,
    logout
  } = useAuth();

  const getRoleDisplayName = () => {
    if (isDraAnaFelicidad) return "Dra. Ana Felicidad";
    if (isProfesional) return "Profesional";
    if (isCliente) return "Cliente";
    return "Usuario";
  };

  const getNavigationItems = (): NavigationItem[] => {
    // Si es Ana Felicidad (administradora), mostrar solo sus opciones específicas
    if (isDraAnaFelicidad) {
      return [
        { href: "/", label: "Inicio" },
        { href: "/servicios", label: "Servicios" },
        { href: "/admin/turnos", label: "Gestión de Turnos", icon: Calendar },
        { href: "/admin/profesionales", label: "Profesionales", icon: Users },
        { href: "/admin/reportes", label: "Reportes", icon: BarChart3 }
      ];
    }

    // Si es profesional, mostrar solo sus opciones específicas
    if (isProfesional) {
      return [
        { href: "/", label: "Inicio" },
        { href: "/servicios", label: "Servicios" },
        { href: "/profesional/agenda", label: "Mi Agenda", icon: Calendar },
        { href: "/profesional/historial-cliente", label: "Historial Clientes", icon: FileText },
        { href: "/profesional/turnos-manana", label: "Turnos Mañana" }
      ];
    }

    // Para clientes y usuarios no logueados
    const items: NavigationItem[] = [
      { href: "/", label: "Inicio" },
      { href: "/servicios", label: "Servicios" },
    ];

    // Solo los clientes logueados ven "Mis Citas"
    if (isSignedIn && isCliente) {
      items.push({ href: "/mis-reservas", label: "Mis Citas", icon: Calendar });
    }

    // Solo clientes y usuarios no logueados ven "Contacto"
    if (!isProfesional && !isDraAnaFelicidad) {
      items.push({ href: "/contacto", label: "Contacto" });
    }

    return items;
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-purple-500 font-bold text-xl">
                Spa Sentirse Bien
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {getNavigationItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-purple-500 px-3 py-2 text-sm font-medium transition-colors flex items-center"
              >
                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                {item.label}
              </Link>
            ))}

            <div className="ml-4 flex items-center space-x-4">
              {isSignedIn && user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {getRoleDisplayName()}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      isDraAnaFelicidad ? 'bg-red-500' : 
                      isProfesional ? 'bg-blue-500' : 'bg-green-500'
                    }`} title={`Rol: ${getRoleDisplayName()}`} />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 rounded-full">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      size="sm"
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-500 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>

        {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              {getNavigationItems().map((item) => (
            <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-500 block px-3 py-2 text-base font-medium transition-colors flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
                  {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                  {item.label}
            </Link>
              ))}

              <div className="mt-4 flex flex-col space-y-2 px-3 border-t pt-4">
                {isSignedIn && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {user.firstName} {user.lastName}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        isDraAnaFelicidad ? 'bg-red-500' : 
                        isProfesional ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                </div>
              ) : (
                <>
                    <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Iniciar Sesión
                    </Button>
                    </Link>
                    <Link href="/register">
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      Registrarse
                    </Button>
                    </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </nav>
  );
}
