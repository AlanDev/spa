# Spa Sentirse Bien - Sistema de Gestión Completo

Sistema integral de gestión para spa con múltiples roles, reservas online, historial de clientes, chatbot inteligente y reportes detallados. Desarrollado para brindar una experiencia completa tanto para clientes como para profesionales y administradores.

## 🌟 Características Principales

- 📅 **Sistema de Reservas Online**: Reserva citas con validación de 48 horas de anticipación
- 👤 **Gestión de Usuarios**: Registro automático de clientes y gestión de profesionales
- 🧘‍♀️ **Catálogo de Servicios**: Masajes, tratamientos faciales, corporales y más
- 📊 **Panel de Administración**: Gestión completa del sistema
- 📱 **Diseño Responsive**: Optimizado para dispositivos móviles y escritorio
- 📧 **Notificaciones por Email**: Confirmaciones automáticas de reservas
- 🔐 **Autenticación Segura**: Sistema de login con Clerk
- 🤖 **Chatbot Inteligente**: Asistente virtual con información dinámica desde base de datos
- 📋 **Historial de Clientes**: Seguimiento completo de tratamientos por cliente
- 📝 **Notas de Tratamiento**: Sistema para que profesionales registren observaciones

## 💰 Sistema de Pago

- **Gestión Simplificada**: Control de pagos en el establecimiento
- **Estados de Pago**: Seguimiento de pagos (pagado/pendiente)
- **Registro de Transacciones**: Historial completo de pagos
- **Comprobantes Automáticos**: Envío por email tras confirmación
- **Descuentos**: 15% descuento con tarjeta de débito

## 🎯 Funcionalidades por Rol

### Para Clientes
- ✅ Registro automático al iniciar sesión
- ✅ Búsqueda y reserva de servicios
- ✅ Gestión de citas (ver, modificar, cancelar)
- ✅ Selección de múltiples servicios por reserva
- ✅ Historial personal de servicios
- ✅ Interacción con chatbot para consultas

### Para Profesionales
- ✅ Dashboard personalizado con agenda diaria
- ✅ Gestión de citas asignadas
- ✅ **Registro de notas de tratamiento** por cliente
- ✅ **Consulta de historial completo** de cada cliente
- ✅ **Búsqueda y listado de clientes** atendidos
- ✅ Gestión de horarios disponibles
- ✅ Reportes de ingresos diarios
- ✅ Impresión de agenda diaria

### Para Administrador
- ✅ Gestión completa de servicios y categorías
- ✅ **Activación/desactivación de usuarios** con roles
- ✅ Administración de profesionales
- ✅ Reportes detallados de ingresos por período
- ✅ Control total del sistema
- ✅ Gestión de configuración del chatbot

## 🤖 Chatbot Inteligente

### Características del Chatbot
- **Información Dinámica**: Todos los datos se cargan desde la base de datos
- **Servicios y Precios**: Muestra servicios reales con precios actualizados
- **Horarios de Atención**: Información de horarios desde configuración
- **Contacto Actualizado**: Teléfono (3624) 123456
- **Ubicación**: UTN Resistencia - French 414, Resistencia, Chaco
- **Responsive**: Adaptado para móvil y escritorio
- **Manejo de Errores**: Funciona incluso con problemas de conexión

### Opciones del Chatbot
- 🌸 **Servicios Disponibles**: Lista completa con precios y duración
- 🕐 **Horarios de Atención**: Información actualizada por día
- 📅 **Cómo Reservar**: Instrucciones paso a paso
- 💰 **Precios**: Tarifas actualizadas por categoría
- 📍 **Ubicación**: Dirección y referencias
- 📞 **Contacto**: Teléfono, WhatsApp y email

## 📋 Modelos de Datos Actualizados

### Reserva (Booking)
```typescript
interface IBooking {
  userId: string;
  userName: string;
  professionalId?: ObjectId;
  professionalName?: string;
  services: Array<{
    serviceId: ObjectId;
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
    serviceCategory: string;
    serviceSubcategory: string;
  }>;
  date: Date;
  timeSlot: string;
  status: "confirmed" | "cancelled" | "rescheduled" | "completed";
  payment: {
    amount: number;
    originalAmount: number;
    discount: number;
    paid: boolean;
    paidAt?: Date;
    transactionId?: string;
    receiptSent: boolean;
  };
  notes?: string;
  treatmentNotes?: string; // NUEVA: Notas del profesional
  reservedAt: Date;
  canModify: boolean;
}
```

### Usuario (User) - Actualizado
```typescript
interface IUser {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "cliente" | "profesional" | "dra_ana_felicidad";
  phone?: string;
  profileImage?: string;
  isActive: boolean; // Control de activación
  professionalData?: {
    specialties: string[];
    license: string;
    experience: number;
    services: ObjectId[];
    schedule: Array<{
      day: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
    bio?: string;
  };
}
```

### Configuración del Negocio (BusinessConfig) - NUEVO
```typescript
interface IBusinessConfig {
  name: string;
  description: string;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  location: {
    address: string;
    city: string;
    province: string;
    details: string[];
  };
  businessHours: {
    monday: { open: string; close: string; isOpen: boolean };
    // ... otros días
  };
  chatbotMessages: {
    welcome: string;
    servicesIntro: string;
    reservationInstructions: string;
    contactInfo: string;
    locationInfo: string;
  };
  isActive: boolean;
}
```

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: Next.js 15 con TypeScript
- **UI**: Tailwind CSS + Radix UI + Shadcn/ui
- **Autenticación**: Clerk
- **Base de Datos**: MongoDB con Mongoose
- **Estado**: React Hooks personalizados

### APIs Principales
```
├── /api/
│   ├── users/                    # Gestión de usuarios
│   ├── bookings/                # Sistema de reservas
│   ├── services/                # Servicios (agrupados por categoría)
│   ├── business-config/         # Configuración del negocio
│   ├── professionals/           # APIs para profesionales
│   │   ├── bookings/           # Reservas de profesionales
│   │   ├── client-history/     # NUEVA: Historial de clientes
│   │   └── clients/            # NUEVA: Lista de clientes
│   └── reports/                # APIs de reportes
```

### Páginas Nuevas Implementadas
```
├── /profesional/
│   └── historial-cliente/      # NUEVA: Gestión de historial
│       ├── page.tsx           # Lista/búsqueda de clientes
│       └── [id]/page.tsx      # Historial individual
```

## 🚀 Funcionalidades Recién Implementadas

### 1. Historial de Clientes para Profesionales ✨
- **Búsqueda de Clientes**: Lista todos los clientes atendidos
- **Historial Individual**: Visualización completa de tratamientos por cliente
- **Notas de Tratamiento**: Los profesionales pueden agregar observaciones
- **Navegación Integrada**: Enlaces directos desde la agenda

### 2. Chatbot Completamente Dinámico ✨
- **Eliminación de Datos Hardcodeados**: Toda la información viene de la BD
- **Configuración Centralizada**: Modelo BusinessConfig para gestionar contenido
- **Actualización Automática**: Cambios en BD se reflejan instantáneamente
- **Carga Progresiva**: Opciones inmediatas con actualización de datos

### 3. Gestión de Usuarios Mejorada ✨
- **Activación/Desactivación**: Control de acceso por usuario
- **Roles Dinámicos**: Gestión completa de permisos

## 📱 Información de Contacto Actualizada

- **📍 Ubicación**: Universidad Tecnológica Nacional, Facultad Regional Resistencia
- **🏠 Dirección**: French 414, Resistencia, Chaco
- **📞 Teléfono**: (3624) 123456
- **📱 WhatsApp**: (3624) 123456
- **📧 Email**: info@spasentirsebien.com

## 📊 Reportes y Analytics

### Reportes Diarios (Profesionales)
- ✅ Turnos organizados por servicio
- ✅ Estadísticas por profesional
- ✅ Ingresos del día
- ✅ Impresión optimizada

### Reportes Financieros (Administrador)
- ✅ Totales por servicio en período específico
- ✅ Totales por profesional en período específico
- ✅ Análisis de métodos de pago
- ✅ Estadísticas de descuentos

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- MongoDB
- Cuenta de Clerk

### Variables de Entorno
Crear archivo `.env.local`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/spa-sentirse-bien

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Instalación
```bash
# Instalar dependencias
npm install

# Poblar base de datos con datos de ejemplo
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

## 👥 Datos de Prueba

El script de seed crea:
- **Dra. Ana Felicidad**: ana.felicidad@spa.com (Administrador)
- **María García**: maria.garcia@spa.com (Profesional)
- **Carlos Rodríguez**: carlos.rodriguez@spa.com (Profesional)
- **Lucía Martínez**: lucia.martinez@gmail.com (Cliente)
- **Pedro López**: pedro.lopez@gmail.com (Cliente)
- **5 servicios** de ejemplo en diferentes categorías
- **Reservas de prueba** para testear el sistema
- **Configuración inicial** del chatbot

## 🎨 Características de UX

- **Mensajes Claros**: Explicaciones de restricciones y políticas
- **Indicadores Visuales**: Colores por rol, estados de pago
- **Navegación Contextual**: Menús adaptativos según permisos
- **Feedback Inmediato**: Confirmaciones y errores en tiempo real
- **Chatbot Intuitivo**: Interfaz conversacional amigable
- **Historial Organizado**: Visualización clara de tratamientos

## 🔒 Seguridad y Validaciones

- **Autenticación**: Integración completa con Clerk
- **Autorización**: Control de acceso por roles en todas las APIs
- **Validación de Datos**: Validaciones en frontend y backend
- **Restricciones de Negocio**: Reservas solo con 48hs de anticipación
- **Sanitización**: Limpieza de datos de entrada
- **Mensajes de Error**: Sistema completo de notificaciones

## 🔄 Flujos de Trabajo

### Flujo de Reserva
1. Cliente selecciona servicios desde catálogo
2. Elige fecha y horario (validación 48hs automática)
3. Se crea reserva con precio calculado
4. Se envía comprobante por email
5. Pago se gestiona en el spa

### Flujo de Atención (Profesional)
1. Profesional consulta agenda diaria
2. Atiende cliente según horario
3. **NUEVO**: Registra notas de tratamiento
4. **NUEVO**: Consulta historial del cliente si necesario
5. Marca servicio como completado

### Flujo de Consulta (Chatbot)
1. Cliente abre chatbot desde página principal
2. Sistema carga información dinámica desde BD
3. Cliente selecciona opción de interés
4. Chatbot responde con datos actualizados
5. Cliente puede navegar entre opciones o reservar

## ✨ Próximas Mejoras Sugeridas

- 📧 Notificaciones automáticas por WhatsApp
- 📅 Recordatorios de citas 24hs antes
- 💳 Integración con pasarelas de pago online
- 📱 App móvil nativa
- 🔔 Sistema de notificaciones push
- 📈 Dashboard de analytics avanzado

## 🚀 Deploy

Para producción:
```bash
npm run build
npm start
```

Configurar variables de entorno en el servicio de hosting (Vercel recomendado).

---

**Sistema desarrollado para gestión completa de spa con múltiples roles, reservas online, historial de clientes, chatbot inteligente y reportes detallados.**

*Versión actual: 2.0 - Incluye historial de clientes, notas de tratamiento y chatbot dinámico* 