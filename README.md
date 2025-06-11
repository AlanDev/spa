# Spa Sentirse Bien - Sistema de Gestión

Sistema completo de gestión para spa con diferentes tipos de usuarios, reservas online, pagos y reportes.

## 🌟 Características Principales

- 📅 **Sistema de Reservas Online**: Reserva citas con 48 horas de anticipación
- 👤 **Gestión de Usuarios**: Registro de clientes y profesionales
- 🧘‍♀️ **Catálogo de Servicios**: Masajes, tratamientos faciales, corporales y más
- 📊 **Panel de Administración**: Gestión completa para la Dra. Ana Felicidad
- 📱 **Diseño Responsive**: Optimizado para dispositivos móviles y escritorio
- 📧 **Notificaciones por Email**: Confirmaciones automáticas de reservas
- 🔐 **Autenticación Segura**: Sistema de login con Clerk

## 💰 Sistema de Pago

- Gestión de pagos simplificada
- Control de estado de pagos (pagado/pendiente)
- Registro de transacciones
- Comprobantes automáticos por email

## 🎯 Funcionalidades del Sistema

### Para Clientes
- Registro y login
- Búsqueda y reserva de servicios
- Gestión de citas (ver, modificar, cancelar)
- Historial de servicios

### Para Profesionales  
- Dashboard personalizado
- Agenda de citas asignadas
- Gestión de horarios disponibles
- Reportes de ingresos

### Para Administrador (Dra. Ana Felicidad)
- Gestión completa de servicios
- Administración de usuarios y profesionales
- Reportes detallados de ingresos
- Control total del sistema

## 📋 Modelo de Datos

### Estructura de Reservas (Booking)
```javascript
{
  userId: ObjectId,
  userName: string,
  services: [ServiceData],
  date: Date,
  timeSlot: string,
  status: "confirmed" | "cancelled" | "completed",
  payment: {
    amount: number,
    originalAmount: number,
    discount: number,
    paid: boolean,
    paidAt?: Date,
    transactionId?: string,
    receiptSent: boolean
  },
  notes: string
}
```

## ✨ Características Implementadas

### 🧑‍💼 Tipos de Usuario

1. **Clientes**
   - Registro automático al iniciar sesión
   - Pueden ver y reservar servicios
   - Gestión de sus propias reservas
   - Pago con tarjeta de débito (descuento 15%) o efectivo

2. **Profesionales**
   - Gestión de horarios y especialidades
   - Consulta de turnos del día siguiente con impresión
   - Acceso a reportes diarios
   - Asignación de servicios específicos

3. **Dra. Ana Felicidad**
   - Acceso completo al sistema
   - Creación y gestión de profesionales
   - Gestión de servicios
   - Reportes financieros completos
   - Gestión de turnos

### 📅 Sistema de Reservas

- **Restricción de 48 horas**: Solo se puede reservar con 48hs de anticipación
- **Múltiples servicios**: Un cliente puede reservar varios servicios en la misma cita
- **Pago diferenciado**:
  - Tarjeta de débito: 15% de descuento
  - Efectivo: Precio completo
- **Envío automático** de comprobantes por email
- **Gestión de estados**: Confirmado, cancelado, reprogramado, completado

### 💰 Sistema de Pagos

- Simulación de pagos con tarjeta de débito
- Cálculo automático de descuentos
- Generación de comprobantes
- Tracking de pagos pendientes/completados

### 📊 Reportes y Analytics

1. **Reportes Diarios** (Profesionales y Dra. Ana)
   - Turnos organizados por servicio
   - Estadísticas por profesional
   - Ingresos del día

2. **Reportes Financieros** (Solo Dra. Ana)
   - Totales por servicio en período específico
   - Totales por profesional en período específico
   - Análisis de métodos de pago
   - Estadísticas de descuentos

### 🖨️ Funcionalidades de Impresión

- Agenda diaria para profesionales
- Reportes financieros
- Comprobantes de pago

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Frontend**: Next.js 15 con TypeScript
- **UI**: Tailwind CSS + Radix UI + Shadcn/ui
- **Autenticación**: Clerk
- **Base de Datos**: MongoDB con Mongoose
- **Estado**: React Hooks personalizados

### Estructura de Archivos

```
├── app/
│   ├── api/                     # APIs REST
│   │   ├── users/              # Gestión de usuarios
│   │   ├── bookings/           # Sistema de reservas
│   │   ├── professionals/      # APIs para profesionales
│   │   └── reports/            # APIs de reportes
│   ├── profesional/            # Páginas para profesionales
│   ├── reportes/               # Páginas de reportes
│   └── [otras páginas]/
├── models/                     # Modelos de MongoDB
│   ├── user.ts                # Usuarios con roles
│   ├── booking.ts             # Reservas con pagos
│   └── service.ts             # Servicios
├── hooks/                     # React Hooks personalizados
│   └── useUser.ts             # Gestión de usuario y roles
├── components/                # Componentes React
│   ├── ui/                   # Componentes base
│   └── [componentes específicos]/
└── lib/                      # Utilidades
    └── mongodb.ts            # Conexión a DB
```

### Modelos de Datos

#### Usuario
```typescript
interface IUser {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "cliente" | "profesional" | "dra_ana_felicidad";
  phone?: string;
  profileImage?: string;
  isActive: boolean;
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

#### Reserva
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
  reservedAt: Date;
  canModify: boolean;
}
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- MongoDB
- Cuenta de Clerk

### Variables de Entorno

Crear archivo `.env.local`:

```bash
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

### Datos de Prueba

El script de seed crea las siguientes cuentas de ejemplo:

- **Dra. Ana Felicidad**: ana.felicidad@spa.com
- **María García (Profesional)**: maria.garcia@spa.com  
- **Carlos Rodríguez (Profesional)**: carlos.rodriguez@spa.com
- **Lucía Martínez (Cliente)**: lucia.martinez@gmail.com
- **Pedro López (Cliente)**: pedro.lopez@gmail.com

También crea 5 servicios y reservas de ejemplo para probar el sistema.

## 🎯 Funcionalidades por Rol

### Clientes
- ✅ Registro automático al iniciar sesión
- ✅ Ver catálogo de servicios
- ✅ Reservar servicios (respetando 48hs)
- ✅ Seleccionar múltiples servicios por reserva
- ✅ Gestión de pagos simplificada
- ✅ Gestionar sus reservas
- ✅ Recibir comprobantes automáticos

### Profesionales
- ✅ Ver agenda personal
- ✅ Consultar turnos del día siguiente
- ✅ Imprimir agenda diaria
- ✅ Acceder a reportes diarios
- ✅ Gestionar horarios y especialidades

### Dra. Ana Felicidad
- ✅ Todas las funciones de profesional
- ✅ Crear y gestionar profesionales
- ✅ Crear y gestionar servicios
- ✅ Acceso a reportes financieros completos
- ✅ Reportes por servicio y profesional
- ✅ Gestión completa del sistema

## 🔒 Seguridad y Validaciones

- **Autenticación**: Integración completa con Clerk
- **Autorización**: Control de acceso por roles en todas las APIs
- **Validación de datos**: Validaciones en frontend y backend
- **Restricciones de negocio**: Reservas solo con 48hs de anticipación
- **Mensajes de error**: Sistema completo de notificaciones

## 📱 Interfaz de Usuario

- **Diseño responsive**: Funciona en desktop y móviles
- **Navegación intuitiva**: Menús específicos por rol
- **Indicadores visuales**: Estados de pago, reservas, roles
- **Feedback inmediato**: Notificaciones de éxito/error
- **Impresión optimizada**: Formatos específicos para documentos

## 🔄 Estados y Flujos

### Flujo de Reserva
1. Cliente selecciona servicios
2. Elige fecha y horario (validación 48hs)
3. Se crea la reserva con precio estándar
4. Se envía comprobante por email
5. Pago se gestiona en el spa

### Flujo de Reportes
1. Usuario con permisos accede a reportes
2. Selecciona período o fecha
3. Sistema genera datos en tiempo real
4. Visualización de estadísticas
5. Opción de exportar/imprimir

## 🎨 Características de UX

- **Mensajes claros**: Explicaciones de restricciones y políticas
- **Indicadores visuales**: Colores por rol, estados de pago
- **Navegación contextual**: Menús adaptativos según permisos
- **Feedback inmediato**: Confirmaciones y errores en tiempo real
- **Accesibilidad**: Componentes siguiendo mejores prácticas

## 🚀 Deploy

Para production:

```bash
npm run build
npm start
```

Configurar variables de entorno en el servicio de hosting.

---

*Sistema desarrollado para gestión completa de spa con múltiples roles, reservas online, pagos diferenciados y reportes detallados.* 

- ✅ Autenticación de usuarios con roles (cliente, profesional, admin)
- ✅ Catálogo de servicios con categorías y subcategorías
- ✅ Sistema de reservas con validaciones temporales
- ✅ Panel de administración completo
- ✅ Dashboard para profesionales  
- ✅ Gestión de citas (crear, modificar, cancelar)
- ✅ Sistema de pagos simplificado
- ✅ Notificaciones por email
- ✅ Reportes y estadísticas detalladas
- ✅ Diseño responsive y moderno
- ✅ Base de datos MongoDB con modelos optimizados 