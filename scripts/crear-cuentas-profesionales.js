const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://alanmendoz:alanmendoz4@cluster0.gllf6.mongodb.net/spa-management?retryWrites=true&w=majority&appName=Cluster0';

const profesionales = [
  {
    email: 'maria.garcia@sentirsebien.com',
    password: 'maria123',
    firstName: 'María',
    lastName: 'García',
    role: 'profesional',
    professionalData: {
      specialties: ['Masajes', 'Relajación'],
      license: 'MAS-001',
      experience: 8,
      services: [],
      schedule: [
        { day: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
      ],
      bio: 'Especialista en masajes terapéuticos y relajantes con 8 años de experiencia.',
    },
  },
  {
    email: 'carlos.rodriguez@sentirsebien.com',
    password: 'carlos123',
    firstName: 'Carlos',
    lastName: 'Rodríguez',
    role: 'profesional',
    professionalData: {
      specialties: ['Tratamientos Faciales', 'Belleza'],
      license: 'BEL-001',
      experience: 6,
      services: [],
      schedule: [
        { day: 1, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 2, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 3, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 4, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 5, startTime: '10:00', endTime: '18:00', isAvailable: true },
      ],
      bio: 'Experto en tratamientos faciales y servicios de belleza con enfoque en resultados naturales.',
    },
  },
  {
    email: 'lucia.wellness@sentirsebien.com',
    password: 'lucia123',
    firstName: 'Lucía',
    lastName: 'Wellness',
    role: 'profesional',
    professionalData: {
      specialties: ['Tratamientos Corporales', 'Yoga'],
      license: 'COR-001',
      experience: 10,
      services: [],
      schedule: [
        { day: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 5, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { day: 6, startTime: '09:00', endTime: '13:00', isAvailable: true }, // Sábados
      ],
      bio: 'Instructora certificada de yoga y especialista en tratamientos corporales holísticos.',
    },
  },
];

async function crearCuentasProfesionales() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('Conectando a MongoDB...');
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    console.log('Creando cuentas de profesionales...');

    for (const prof of profesionales) {
      // Verificar si ya existe
      const existingUser = await usersCollection.findOne({ email: prof.email });
      
      if (existingUser) {
        console.log(`✓ Usuario ${prof.email} ya existe - omitiendo`);
        continue;
      }

      // Hash de la contraseña
      const hashedPassword = bcrypt.hashSync(prof.password, 12);

      const userData = {
        ...prof,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await usersCollection.insertOne(userData);
      console.log(`✓ Creado: ${prof.firstName} ${prof.lastName} (${prof.email})`);
    }

    console.log('\n🎉 ¡Cuentas de profesionales creadas exitosamente!');
    console.log('\nCredenciales de acceso:');
    console.log('═══════════════════════════════════════════════');
    
    profesionales.forEach(prof => {
      console.log(`📧 ${prof.email}`);
      console.log(`🔑 ${prof.password}`);
      console.log(`👤 ${prof.firstName} ${prof.lastName} - ${prof.professionalData.specialties.join(', ')}`);
      console.log('─────────────────────────────────────────────');
    });

    console.log('\n💡 Instrucciones:');
    console.log('1. Ve a /login para iniciar sesión');
    console.log('2. Usa cualquiera de las credenciales de arriba');
    console.log('3. Los profesionales pueden gestionar sus servicios y horarios');
    console.log('4. Para la Dra. Ana Felicidad, registra una cuenta nueva (será automáticamente administradora)');

  } catch (error) {
    console.error('❌ Error creando cuentas:', error);
  } finally {
    await client.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearCuentasProfesionales();
}

module.exports = { crearCuentasProfesionales }; 