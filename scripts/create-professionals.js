const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createProfessionals() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Limpiar colección existente
    await usersCollection.deleteMany({});
    console.log('🧹 Colección users limpiada');

    // Función para hashear contraseña
    const hashPassword = (password) => {
      const salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(password, salt);
    };

    // Crear Ana Felicidad (administradora)
    const anaFelicidad = {
      email: 'ana@spasentirsebieng.com',
      password: hashPassword('123456'),
      firstName: 'Ana',
      lastName: 'Felicidad',
      role: 'dra_ana_felicidad',
      isActive: true,
      professionalData: {
        specialties: ['Administración', 'Gestión de Spa', 'Todos los Tratamientos'],
        description: 'Directora del Spa Sentirse Bien con acceso completo al sistema.',
        experience: 15,
        license: 'ADM-001',
        services: [],
        schedule: [
          { day: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
          { day: 5, startTime: '09:00', endTime: '18:00', isAvailable: true },
        ],
        bio: 'Directora del Spa Sentirse Bien con acceso completo al sistema.',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Crear profesionales
    const profesionales = [
      {
        email: 'maria@spa.com',
        password: hashPassword('123456'),
        firstName: 'María',
        lastName: 'García',
        role: 'professional',
        isActive: true,
        professionalData: {
          specialties: ['Masajes terapéuticos', 'Tratamientos corporales'],
          description: 'Especialista en masajes relajantes y terapéuticos.',
          experience: 8,
          certification: 'Certificada en Terapia Manual',
          workingHours: {
            start: '09:00',
            end: '17:00'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'carlos@spa.com',
        password: hashPassword('123456'),
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        role: 'professional',
        isActive: true,
        professionalData: {
          specialties: ['Tratamientos faciales', 'Belleza'],
          description: 'Experto en cuidado facial y tratamientos de belleza.',
          experience: 6,
          certification: 'Certificado en Estética Facial',
          workingHours: {
            start: '10:00',
            end: '18:00'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: 'lucia@spa.com',
        password: hashPassword('123456'),
        firstName: 'Lucía',
        lastName: 'Wellness',
        role: 'professional',
        isActive: true,
        professionalData: {
          specialties: ['Wellness', 'Masajes'],
          description: 'Especialista en bienestar integral y relajación.',
          experience: 5,
          certification: 'Certificada en Wellness',
          workingHours: {
            start: '08:00',
            end: '16:00'
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Insertar Ana Felicidad
    console.log('👑 Creando Ana Felicidad...');
    await usersCollection.insertOne(anaFelicidad);
    console.log('✅ Ana Felicidad creada');

    // Insertar profesionales
    console.log('👩‍⚕️ Creando profesionales...');
    await usersCollection.insertMany(profesionales);
    console.log('✅ Profesionales creados');

    console.log('\n🎉 Base de datos poblada exitosamente!');
    console.log('\n📋 CREDENCIALES PARA PROBAR:');
    console.log('===============================');
    console.log('🔑 Ana Felicidad (Administradora):');
    console.log('   Email: ana@spasentirsebieng.com');
    console.log('   Contraseña: 123456');
    console.log('\n👩‍⚕️ María García (Profesional):');
    console.log('   Email: maria@spa.com');
    console.log('   Contraseña: 123456');
    console.log('\n👨‍⚕️ Carlos Rodríguez (Profesional):');
    console.log('   Email: carlos@spa.com');
    console.log('   Contraseña: 123456');
    console.log('\n👩‍⚕️ Lucía Wellness (Profesional):');
    console.log('   Email: lucia@spa.com');
    console.log('   Contraseña: 123456');
    console.log('\n💡 Usa cualquiera de estas credenciales para hacer login');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createProfessionals();
}

module.exports = { createProfessionals }; 