"use client";

import { Suspense } from "react"
import ServicesList from "@/components/services-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { Plus, Settings } from "lucide-react"
import Link from "next/link"

export default function ServiciosPage() {
  const { isDraAnaFelicidad } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra amplia gama de tratamientos diseñados para tu bienestar y relajación
            </p>
          </div>
          
          {isDraAnaFelicidad && (
            <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
              <Button 
                asChild
                className="bg-green-500 hover:bg-green-600 text-sm"
                size="sm"
              >
                <Link href="/admin/servicios/nuevo">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Nuevo Servicio</span>
                  <span className="sm:hidden">Nuevo</span>
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="sm"
                className="text-sm"
              >
                <Link href="/admin/servicios">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Gestionar</span>
                  <span className="sm:hidden">Admin</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="masajes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8 h-auto p-1">
          <TabsTrigger value="masajes" className="text-xs sm:text-sm py-2 sm:py-1.5">
            Masajes
          </TabsTrigger>
          <TabsTrigger value="belleza" className="text-xs sm:text-sm py-2 sm:py-1.5">
            Belleza
          </TabsTrigger>
          <TabsTrigger value="faciales" className="text-xs sm:text-sm py-2 sm:py-1.5 col-span-2 sm:col-span-1">
            <span className="hidden sm:inline">Tratamientos Faciales</span>
            <span className="sm:hidden">Faciales</span>
          </TabsTrigger>
          <TabsTrigger value="corporales" className="text-xs sm:text-sm py-2 sm:py-1.5 col-span-2 sm:col-span-1">
            <span className="hidden sm:inline">Tratamientos Corporales</span>
            <span className="sm:hidden">Corporales</span>
          </TabsTrigger>
          <TabsTrigger value="grupales" className="text-xs sm:text-sm py-2 sm:py-1.5 col-span-2 sm:col-span-1">
            <span className="hidden sm:inline">Servicios Grupales</span>
            <span className="sm:hidden">Grupales</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="masajes">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Masajes</h2>
            <p className="text-gray-600">Libera tensiones y encuentra la relajación que necesitas</p>
          </div>
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesList category="Masajes" />
          </Suspense>
        </TabsContent>

        <TabsContent value="belleza">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Belleza</h2>
            <p className="text-gray-600">Realza tu belleza natural con nuestros tratamientos especializados</p>
          </div>
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesList category="Belleza" />
          </Suspense>
        </TabsContent>

        <TabsContent value="faciales">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tratamientos Faciales</h2>
            <p className="text-gray-600">Cuida y rejuvenece tu rostro con tecnología de vanguardia</p>
          </div>
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesList category="Tratamientos Faciales" />
          </Suspense>
        </TabsContent>

        <TabsContent value="corporales">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tratamientos Corporales</h2>
            <p className="text-gray-600">Modela y mejora tu figura con nuestros tratamientos corporales</p>
          </div>
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesList category="Tratamientos Corporales" />
          </Suspense>
        </TabsContent>

        <TabsContent value="grupales">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Servicios Grupales</h2>
            <p className="text-gray-600">Disfruta de experiencias de bienestar compartidas</p>
          </div>
          <Suspense fallback={<ServicesSkeleton />}>
            <ServicesList category="Servicios Grupales" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ServicesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
    </div>
  )
}
