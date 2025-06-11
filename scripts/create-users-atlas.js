const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createUsersAtlas() {
  // URI para MongoDB Atlas con las credenciales actualizadas del usuario
  const username = 'alan';
  const password = '123';
  const dbName = 'spa-sentirse-bien';
  
  // URI completa proporcionada por el usuario
  const atlasUri = `mongodb+srv://${username}:${password}@cluster0.l7fqtuz.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
  
  const client = new MongoClient(atlasUri);

  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    console.log('📍 Cluster: cluster0.l7fqtuz.mongodb.net');
    console.log('👤 Usuario:', username);
    console.log('🔑 Contraseña: ***');
    console.log('🗄️ Base de datos:', dbName);
    
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas exitosamente!');

    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    // Limpiar usuarios existentes
    const deleteResult = await usersCollection.deleteMany({});
    console.log(`🧹 ${deleteResult.deletedCount} usuarios existentes eliminados`);

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

    console.log('👥 Insertando usuarios en Atlas...');
    const result = await usersCollection.insertMany(users);
    console.log(`✅ ${result.insertedCount} usuarios creados exitosamente en MongoDB Atlas!`);

    // Verificar
    const count = await usersCollection.countDocuments();
    console.log(`📊 Total de usuarios en la base de datos: ${count}`);

    // Mostrar usuarios creados
    const allUsers = await usersCollection.find({}).toArray();
    console.log('\n👤 Usuarios creados en MongoDB Atlas:');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    console.log('\n🎯 CREDENCIALES PARA PROBAR EN LA APLICACIÓN:');
    console.log('==============================================');
    console.log('🔑 Ana Felicidad (Administradora): ana@spa.com / 123456');
    console.log('👩‍⚕️ María García (Profesional): maria@spa.com / 123456');
    console.log('👨‍⚕️ Carlos Rodríguez (Profesional): carlos@spa.com / 123456');
    console.log('👩‍⚕️ Lucía Wellness (Profesional): lucia@spa.com / 123456');

    console.log(`\n📍 Los usuarios están guardados en: ${db.databaseName}.users`);
    console.log('\n🔄 SIGUIENTE PASO: Configura tu aplicación con la URI de Atlas');

  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('🔐 Error de autenticación - verifica:');
      console.log('   - Usuario: alan');
      console.log('   - Contraseña: 123');
      console.log('   - Ve a Database Access en MongoDB Atlas');
    }
    
    if (error.message.includes('IP not in whitelist')) {
      console.log('🌐 Tu IP no está en la whitelist de Atlas');
      console.log('   - Ve a Network Access en Atlas');
      console.log('   - Agrega tu IP o usa 0.0.0.0/0 para permitir todas');
    }
    
    if (error.message.includes('Could not connect')) {
      console.log('🔗 Problema de conectividad - verifica tu internet');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Conexión a Atlas cerrada');
  }
}

createUsersAtlas(); 