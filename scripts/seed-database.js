// Este archivo es una versión compilada del script TypeScript para ejecutarlo directamente con Node.js
require("dotenv").config()
const mongoose = require("mongoose")
const { MongoClient, ObjectId } = require('mongodb');

// Definición del modelo de Servicio
const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    image: { type: String },
  },
  { timestamps: true },
)

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Limpiar colecciones existentes
    await db.collection('users').deleteMany({});
    await db.collection('services').deleteMany({});
    await db.collection('bookings').deleteMany({});
    
    console.log('Cleared existing data');
    
    // Crear usuarios
    const users = [
      {
        clerkId: 'dra_ana_felicidad_001',
        email: 'ana.felicidad@spa.com',
        firstName: 'Ana',
        lastName: 'Felicidad',
        role: 'dra_ana_felicidad',
        phone: '+54 11 1234-5678',
        isActive: true,
        professionalData: {
          specialties: ['Administración', 'Gestión de Spa'],
          license: 'ADM-001',
          experience: 15,
          services: [],
          schedule: [
            { day: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
            { day: 5, startTime: '09:00', endTime: '18:00', isAvailable: true },
          ],
          bio: 'Directora y fundadora del Spa Sentirse Bien con más de 15 años de experiencia.',
        },
      },
      {
        clerkId: 'prof_maria_garcia_001',
        email: 'maria.garcia@spa.com',
        firstName: 'María',
        lastName: 'García',
        role: 'profesional',
        phone: '+54 11 2345-6789',
        isActive: true,
        professionalData: {
          specialties: ['Masajes', 'Relajación', 'Tratamientos Corporales'],
          license: 'PROF-001',
          experience: 8,
          services: [],
          schedule: [
            { day: 1, startTime: '10:00', endTime: '19:00', isAvailable: true },
            { day: 2, startTime: '10:00', endTime: '19:00', isAvailable: true },
            { day: 3, startTime: '10:00', endTime: '19:00', isAvailable: true },
            { day: 4, startTime: '10:00', endTime: '19:00', isAvailable: true },
            { day: 5, startTime: '10:00', endTime: '19:00', isAvailable: true },
            { day: 6, startTime: '09:00', endTime: '15:00', isAvailable: true },
          ],
          bio: 'Especialista en masajes terapéuticos y técnicas de relajación.',
        },
      },
      {
        clerkId: 'prof_carlos_rodriguez_001',
        email: 'carlos.rodriguez@spa.com',
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        role: 'profesional',
        phone: '+54 11 3456-7890',
        isActive: true,
        professionalData: {
          specialties: ['Tratamientos Faciales', 'Cuidado de la Piel', 'Belleza'],
          license: 'PROF-002',
          experience: 5,
          services: [],
          schedule: [
            { day: 2, startTime: '11:00', endTime: '20:00', isAvailable: true },
            { day: 3, startTime: '11:00', endTime: '20:00', isAvailable: true },
            { day: 4, startTime: '11:00', endTime: '20:00', isAvailable: true },
            { day: 5, startTime: '11:00', endTime: '20:00', isAvailable: true },
            { day: 6, startTime: '10:00', endTime: '16:00', isAvailable: true },
          ],
          bio: 'Experto en tratamientos faciales y cuidado personalizado de la piel.',
        },
      },
      {
        clerkId: 'prof_lucia_martinez_001',
        email: 'lucia.wellness@spa.com',
        firstName: 'Lucía',
        lastName: 'Wellness',
        role: 'profesional',
        phone: '+54 11 4567-8901',
        isActive: true,
        professionalData: {
          specialties: ['Servicios Grupales', 'Yoga', 'Hidromasajes'],
          license: 'PROF-003',
          experience: 6,
          services: [],
          schedule: [
            { day: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 6, startTime: '08:00', endTime: '14:00', isAvailable: true },
            { day: 0, startTime: '10:00', endTime: '16:00', isAvailable: true },
          ],
          bio: 'Instructora de yoga certificada y especialista en terapias grupales.',
        },
      },
      {
        clerkId: 'client_test_user_001',
        email: 'cliente@test.com',
        firstName: 'Cliente',
        lastName: 'Test',
        role: 'cliente',
        phone: '+54 11 5678-9012',
        isActive: true,
      },
    ];
    
    const insertedUsers = await db.collection('users').insertMany(users);
    console.log(`Created ${insertedUsers.insertedCount} users`);
    
    // Obtener IDs de los profesionales
    const professionals = await db.collection('users').find({ 
      role: { $in: ['profesional', 'dra_ana_felicidad'] } 
    }).toArray();
    
    const maria = professionals.find(p => p.firstName === 'María');
    const carlos = professionals.find(p => p.firstName === 'Carlos');
    const lucia = professionals.find(p => p.firstName === 'Lucía');
    const ana = professionals.find(p => p.firstName === 'Ana');
    
    // Crear servicios completos
const services = [
      // === MASAJES ===
      {
        name: 'Masaje Anti-stress',
        description: 'Masaje relajante para aliviar el estrés y la tensión muscular del día a día.',
        category: 'Masajes',
        subcategory: 'Relajación',
        price: 8500,
    duration: 60,
        professionals: [maria._id, ana._id],
        isActive: true,
        availableTimeSlots: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
        availableDays: [1, 2, 3, 4, 5, 6],
        image: '/images/services/masaje-antistress.jpg'
      },
      {
        name: 'Masaje Descontracturante',
        description: 'Masaje terapéutico profundo para aliviar contracturas y dolores musculares específicos.',
        category: 'Masajes',
        subcategory: 'Terapéutico',
        price: 9500,
        duration: 90,
        professionals: [maria._id, ana._id],
        isActive: true,
        availableTimeSlots: ['10:00', '12:00', '14:30', '16:30'],
        availableDays: [1, 2, 3, 4, 5, 6],
        image: '/images/services/masaje-descontracturante.jpg'
      },
      {
        name: 'Masaje con Piedras Calientes',
        description: 'Masaje relajante con piedras volcánicas calientes que proporcionan calor terapéutico.',
        category: 'Masajes',
        subcategory: 'Especializado',
        price: 12000,
    duration: 75,
        professionals: [maria._id],
        isActive: true,
        availableTimeSlots: ['11:00', '14:00', '16:00'],
        availableDays: [2, 3, 4, 5, 6],
        image: '/images/services/masaje-piedras-calientes.jpg'
      },
      {
        name: 'Masaje Circulatorio',
        description: 'Masaje específico para mejorar la circulación sanguínea y linfática.',
        category: 'Masajes',
        subcategory: 'Terapéutico',
        price: 8000,
    duration: 60,
        professionals: [maria._id, ana._id],
        isActive: true,
        availableTimeSlots: ['10:00', '11:00', '15:00', '16:00', '17:00'],
        availableDays: [1, 2, 3, 4, 5, 6],
        image: '/images/services/masaje-circulatorio.jpg'
      },

      // === BELLEZA ===
      {
        name: 'Lifting de Pestañas',
        description: 'Tratamiento profesional para levantar y curvar las pestañas naturales de forma duradera.',
        category: 'Belleza',
        subcategory: 'Ojos',
        price: 4500,
    duration: 45,
        professionals: [carlos._id],
        isActive: true,
        availableTimeSlots: ['11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
        availableDays: [2, 3, 4, 5, 6],
        image: '/images/services/lifting-pestanas.jpg'
      },
      {
        name: 'Depilación Facial',
        description: 'Depilación profesional de zonas faciales con técnicas suaves y precisas.',
        category: 'Belleza',
        subcategory: 'Depilación',
        price: 3500,
    duration: 30,
        professionals: [carlos._id],
        isActive: true,
        availableTimeSlots: ['11:00', '11:30', '14:00', '14:30', '15:00', '16:00', '17:00'],
        availableDays: [2, 3, 4, 5, 6],
        image: '/images/services/depilacion-facial.jpg'
      },
      {
        name: 'Belleza de Manos y Pies',
        description: 'Tratamiento completo de manicuría y pedicuría para el cuidado integral de manos y pies.',
        category: 'Belleza',
        subcategory: 'Manicuría/Pedicuría',
        price: 6500,
        duration: 90,
        professionals: [carlos._id],
        isActive: true,
        availableTimeSlots: ['11:00', '14:00', '16:00'],
        availableDays: [2, 3, 4, 5, 6],
        image: '/images/services/belleza-manos-pies.jpg'
      },

      // === TRATAMIENTOS FACIALES ===
      {
        name: 'Punta de Diamante: Microexfoliación',
        description: 'Tratamiento de microdermoabrasión con punta de diamante para renovar y suavizar la piel.',
        category: 'Tratamientos Faciales',
        subcategory: 'Exfoliación',
        price: 7500,
        duration: 60,
        professionals: [carlos._id, ana._id],
        isActive: true,
        availableTimeSlots: ['11:00', '12:00', '14:00', '15:00', '16:00'],
        availableDays: [2, 3, 4, 5, 6],
        image: '/images/services/punta-diamante.jpg'
      },
      {
        name: 'Limpieza Profunda + Hidratación',
        description: 'Limpieza facial profunda seguida de hidratación intensiva para una piel radiante.',
        category: 'Tratamientos Faciales',
        subcategory: 'Hidratación',
        price: 8500,
        duration: 75,
        professionals: [carlos._id, ana._id],
        isActive: true,
        availableTimeSlots: ['11:00', '12:30', '14:00', '15:30', '17:00'],
        availableDays: [2, 3, 4, 5, 6],
        image: '/images/services/limpieza-hidratacion.jpg'
      },
      {
        name: 'Criofrecuencia Facial',
    description: 'Tratamiento que produce "SHOCK TÉRMICO" logrando resultados instantáneos de efecto lifting.',
        category: 'Tratamientos Faciales',
        subcategory: 'Anti-edad',
        price: 15000,
    duration: 60,
        professionals: [carlos._id, ana._id],
        isActive: true,
        availableTimeSlots: ['11:00', '14:00', '16:00'],
        availableDays: [3, 4, 5, 6],
        image: '/images/services/criofrecuencia-facial.jpg'
      },

      // === TRATAMIENTOS CORPORALES ===
      {
        name: 'VelaSlim',
        description: 'Tratamiento avanzado para la reducción de la circunferencia corporal y eliminación de celulitis.',
        category: 'Tratamientos Corporales',
        subcategory: 'Reductivo',
        price: 12000,
    duration: 60,
        professionals: [maria._id, ana._id],
        isActive: true,
        availableTimeSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'],
        availableDays: [1, 2, 3, 4, 5, 6],
        image: '/images/services/velaslim.jpg'
      },
      {
        name: 'DermoHealth',
        description: 'Tratamiento que moviliza los distintos tejidos de la piel y estimula la microcirculación, generando un drenaje linfático.',
        category: 'Tratamientos Corporales',
        subcategory: 'Drenaje',
        price: 10000,
        duration: 75,
        professionals: [maria._id, ana._id],
        isActive: true,
        availableTimeSlots: ['10:00', '11:30', '14:00', '15:30', '17:00'],
        availableDays: [1, 2, 3, 4, 5, 6],
        image: '/images/services/dermohealth.jpg'
      },
      {
        name: 'Criofrecuencia Corporal',
        description: 'Tratamiento corporal que produce un efecto de lifting instantáneo en la piel.',
        category: 'Tratamientos Corporales',
        subcategory: 'Lifting',
        price: 14000,
        duration: 90,
        professionals: [maria._id, ana._id],
        isActive: true,
        availableTimeSlots: ['10:00', '12:00', '14:00', '16:00'],
        availableDays: [1, 2, 3, 4, 5],
        image: '/images/services/criofrecuencia-corporal.jpg'
      },
      {
        name: 'Ultracavitación',
        description: 'Técnica reductora avanzada que utiliza ultrasonidos para eliminar grasa localizada.',
        category: 'Tratamientos Corporales',
        subcategory: 'Reductivo',
        price: 11000,
    duration: 60,
        professionals: [maria._id, ana._id],
        isActive: true,
        availableTimeSlots: ['10:00', '11:00', '14:00', '15:00', '16:00'],
        availableDays: [1, 2, 3, 4, 5, 6],
        image: '/images/services/ultracavitacion.jpg'
      },

      // === SERVICIOS GRUPALES ===
      {
        name: 'Hidromasajes',
        description: 'Sesión relajante de hidromasaje en jacuzzi para grupos de hasta 4 personas.',
        category: 'Servicios Grupales',
        subcategory: 'Hidromasajes',
        price: 15000,
    duration: 60,
        professionals: [lucia._id, ana._id],
        isActive: true,
        availableTimeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        availableDays: [1, 3, 5, 6, 0],
        image: '/images/services/hidromasajes.jpg'
      },
      {
        name: 'Yoga',
        description: 'Clase de yoga grupal para relajación y bienestar físico y mental. Grupos de hasta 10 personas.',
        category: 'Servicios Grupales',
        subcategory: 'Yoga',
        price: 4000,
    duration: 90,
        professionals: [lucia._id],
        isActive: true,
        availableTimeSlots: ['09:00', '10:30', '16:00', '17:30'],
        availableDays: [1, 3, 5, 6, 0],
        image: '/images/services/yoga.jpg'
      },
    ];
    
    const insertedServices = await db.collection('services').insertMany(services);
    console.log(`Created ${insertedServices.insertedCount} services`);
    
    // Actualizar profesionales con servicios
    const serviceIds = Object.values(insertedServices.insertedIds);
    
    // María García - Masajes y Tratamientos Corporales
    await db.collection('users').updateOne(
      { _id: maria._id },
      { 
        $set: { 
          'professionalData.services': serviceIds.filter((_, index) => [0, 1, 2, 3, 11, 12, 13, 14].includes(index))
        }
      }
    );
    
    // Carlos Rodríguez - Belleza y Tratamientos Faciales
    await db.collection('users').updateOne(
      { _id: carlos._id },
      { 
        $set: { 
          'professionalData.services': serviceIds.filter((_, index) => [4, 5, 6, 7, 8, 9, 10].includes(index))
        }
      }
    );
    
    // Lucía Wellness - Servicios Grupales
    await db.collection('users').updateOne(
      { _id: lucia._id },
      { 
        $set: { 
          'professionalData.services': serviceIds.filter((_, index) => [15, 16].includes(index))
        }
      }
    );
    
    // Dra. Ana Felicidad - Todos los servicios
    await db.collection('users').updateOne(
      { _id: ana._id },
      { 
        $set: { 
          'professionalData.services': serviceIds
        }
      }
    );
    
    // Crear reservas de ejemplo
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const bookings = [
      {
        userId: 'client_test_user_001',
        userName: 'Cliente Test',
        professionalId: maria._id,
        professionalName: 'María García',
        services: [{
          serviceId: serviceIds[0], // Masaje Anti-stress
          serviceName: 'Masaje Anti-stress',
          servicePrice: 8500,
          serviceDuration: 60,
          serviceCategory: 'Masajes',
          serviceSubcategory: 'Relajación',
        }],
        date: tomorrow,
        timeSlot: '10:00',
        status: 'confirmed',
        payment: {
          method: 'tarjeta_debito',
          amount: 7225, // Con descuento del 15%
          originalAmount: 8500,
          discount: 15,
          paid: true,
          paidAt: new Date(),
          transactionId: 'TXN_001',
          receiptSent: true,
        },
        notes: 'Primera visita al spa',
        reservedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        canModify: false,
      },
      {
        userId: 'client_test_user_001',
        userName: 'Cliente Test',
        professionalId: carlos._id,
        professionalName: 'Carlos Rodríguez',
        services: [{
          serviceId: serviceIds[8], // Limpieza Profunda + Hidratación
          serviceName: 'Limpieza Profunda + Hidratación',
          servicePrice: 8500,
          serviceDuration: 75,
          serviceCategory: 'Tratamientos Faciales',
          serviceSubcategory: 'Hidratación',
        }],
        date: dayAfterTomorrow,
        timeSlot: '14:00',
        status: 'confirmed',
        payment: {
          method: 'pendiente',
          amount: 8500,
          originalAmount: 8500,
          discount: 0,
          paid: false,
          receiptSent: false,
        },
        notes: 'Solicita música relajante',
        reservedAt: new Date(),
        canModify: true,
      },
    ];
    
    const insertedBookings = await db.collection('bookings').insertMany(bookings);
    console.log(`Created ${insertedBookings.insertedCount} bookings`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 CUENTAS DE ACCESO CREADAS:');
    console.log('=====================================');
    console.log('🩺 DRA. ANA FELICIDAD (Administradora):');
    console.log('   Email: ana.felicidad@spa.com');
    console.log('   ClerkId: dra_ana_felicidad_001');
    console.log('   Permisos: Gestión completa del spa');
    console.log('');
    console.log('👩‍⚕️ PROFESIONALES:');
    console.log('   María García (Masajes): maria.garcia@spa.com');
    console.log('   Carlos Rodríguez (Belleza/Faciales): carlos.rodriguez@spa.com');
    console.log('   Lucía Wellness (Servicios Grupales): lucia.wellness@spa.com');
    console.log('');
    console.log('👤 CLIENTE DE PRUEBA:');
    console.log('   Email: cliente@test.com');
    console.log('   ClerkId: client_test_user_001');
    console.log('');
    console.log('📊 SERVICIOS CREADOS:');
    console.log(`   Total: ${insertedServices.insertedCount} servicios`);
    console.log('   - Masajes: 4 servicios');
    console.log('   - Belleza: 3 servicios');
    console.log('   - Tratamientos Faciales: 3 servicios');
    console.log('   - Tratamientos Corporales: 4 servicios');
    console.log('   - Servicios Grupales: 2 servicios');
    console.log('');
    console.log('📅 RESERVAS DE EJEMPLO: 2 reservas creadas');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

// Ejecutar el script
seedDatabase()
