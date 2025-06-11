const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createUsersSimple() {
  // Usar la misma URI que usaría la aplicación
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spa-sentirse-bien';
  const client = new MongoClient(uri);

  try {
    console.log('🔍 Conectando a:', uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Limpiar usuarios existentes
    await usersCollection.deleteMany({});
    console.log('🧹 Base de datos limpiada');

    // Función para hashear contraseña
    const hashPassword = (password) => {
      const salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(password, salt);
    };

    // Crear usuarios
    const users = [
      {
        email: 'ana@spa.com',
        password: hashPassword('123456'),
        firstName: 'Ana',
        lastName: 'Felicidad',
        role: 'dra_ana_felicidad',
        isActive: true,
        professionalData: {
          specialties: ['Administración', 'Gestión de Spa'],
          description: 'Directora del Spa Sentirse Bien',
          experience: 15,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    console.log('👥 Insertando usuarios...');
    const result = await usersCollection.insertMany(users);
    console.log(`✅ ${result.insertedCount} usuarios creados exitosamente`);

    // Verificar
    const count = await usersCollection.countDocuments();
    console.log(`📊 Total de usuarios en la base de datos: ${count}`);

    // Mostrar usuarios creados
    const allUsers = await usersCollection.find({}).toArray();
    console.log('\n👤 Usuarios en la base de datos:');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    console.log('\n🎯 CREDENCIALES PARA PROBAR:');
    console.log('=================================');
    console.log('🔑 Ana Felicidad (Admin): ana@spa.com / 123456');
    console.log('👩‍⚕️ María García: maria@spa.com / 123456');
    console.log('👨‍⚕️ Carlos Rodríguez: carlos@spa.com / 123456');
    console.log('👩‍⚕️ Lucía Wellness: lucia@spa.com / 123456');

    console.log(`\n📍 Los usuarios están en: ${db.databaseName}.users`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

createUsersSimple(); 