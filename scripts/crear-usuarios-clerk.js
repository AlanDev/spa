require("dotenv").config()
const { MongoClient } = require('mongodb');

async function crearUsuariosReferencia() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Limpiar usuarios existentes
    await db.collection('users').deleteMany({});
    console.log('Usuarios existentes eliminados');
    
    // Crear usuarios de referencia con clerkIds que corresponderán a los emails
    const usuariosReferencia = [
      {
        clerkId: 'admin_clerk_001', // Este será reemplazado cuando el usuario se registre
        email: 'admin@test.com',
        firstName: 'Administrador',
        lastName: 'Spa',
        role: 'dra_ana_felicidad',
        phone: '+54 11 1234-5678',
        isActive: true,
        professionalData: {
          specialties: ['Administración', 'Gestión de Spa', 'Todos los Tratamientos'],
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
          bio: 'Administrador del sistema con acceso completo.',
        },
      },
      {
        clerkId: 'maria_clerk_001',
        email: 'maria.garcia@test.com',
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
        clerkId: 'carlos_clerk_001',
        email: 'carlos.rodriguez@test.com',
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
        clerkId: 'lucia_clerk_001',
        email: 'lucia.wellness@test.com',
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
        clerkId: 'cliente_clerk_001',
        email: 'cliente@test.com',
        firstName: 'Cliente',
        lastName: 'Test',
        role: 'cliente',
        phone: '+54 11 5678-9012',
        isActive: true,
      },
    ];
    
    const insertedUsers = await db.collection('users').insertMany(usuariosReferencia);
    console.log(`✅ ${insertedUsers.insertedCount} usuarios de referencia creados`);
    
    console.log('\n🎯 EMAILS PARA REGISTRARTE EN CLERK:');
    console.log('=====================================');
    console.log('');
    console.log('🔑 ADMINISTRADOR (Dra. Ana Felicidad):');
    console.log('   📧 Email: admin@test.com');
    console.log('   🔒 Contraseña: [la que tú elijas al registrarte]');
    console.log('   🎯 Rol asignado: Administrador completo');
    console.log('');
    console.log('👩‍⚕️ PROFESIONAL DE MASAJES:');
    console.log('   📧 Email: maria.garcia@test.com');
    console.log('   🔒 Contraseña: [la que tú elijas al registrarte]');
    console.log('   🎯 Rol asignado: Profesional (Masajes y Corporales)');
    console.log('');
    console.log('👨‍⚕️ PROFESIONAL DE BELLEZA:');
    console.log('   📧 Email: carlos.rodriguez@test.com');
    console.log('   🔒 Contraseña: [la que tú elijas al registrarte]');
    console.log('   🎯 Rol asignado: Profesional (Belleza y Faciales)');
    console.log('');
    console.log('🧘‍♀️ PROFESIONAL DE YOGA:');
    console.log('   📧 Email: lucia.wellness@test.com');
    console.log('   🔒 Contraseña: [la que tú elijas al registrarte]');
    console.log('   🎯 Rol asignado: Profesional (Servicios Grupales)');
    console.log('');
    console.log('👤 CLIENTE:');
    console.log('   📧 Email: cliente@test.com');
    console.log('   🔒 Contraseña: [la que tú elijas al registrarte]');
    console.log('   🎯 Rol asignado: Cliente');
    console.log('');
    console.log('📝 INSTRUCCIONES:');
    console.log('1. Ve a tu aplicación web');
    console.log('2. Haz clic en "Registrarse"');
    console.log('3. Usa uno de los emails de arriba');
    console.log('4. Elige tu contraseña');
    console.log('5. ¡El sistema te asignará automáticamente el rol!');
    
  } catch (error) {
    console.error('Error creando usuarios:', error);
  } finally {
    await client.close();
  }
}

crearUsuariosReferencia(); 