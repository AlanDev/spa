const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createUsersAtlas() {
  // URI exacta proporcionada por el usuario (sin especificar base de datos)
  const username = 'alan';
  const password = '123';
  const dbName = 'spa-sentirse-bien';
  
  // URI exacta como la proporcionó el usuario
  const atlasUri = `mongodb+srv://${username}:${password}@cluster0.l7fqtuz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  
  console.log('🔗 Conectando a MongoDB Atlas...');
  console.log('📍 URI: mongodb+srv://alan:***@cluster0.l7fqtuz.mongodb.net/');
  console.log('🗄️ Base de datos a usar:', dbName);
  
  const client = new MongoClient(atlasUri);

  try {
    await client.connect();
    console.log('✅ ¡CONEXIÓN EXITOSA A MONGODB ATLAS!');

    // Especificar la base de datos después de conectar
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

    console.log('👥 Insertando usuarios en MongoDB Atlas...');
    const result = await usersCollection.insertMany(users);
    console.log(`✅ ${result.insertedCount} usuarios creados exitosamente!`);

    // Verificar
    const count = await usersCollection.countDocuments();
    console.log(`📊 Total de usuarios en Atlas: ${count}`);

    // Mostrar usuarios creados
    const allUsers = await usersCollection.find({}).toArray();
    console.log('\n👤 Usuarios en MongoDB Atlas:');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });

    console.log('\n🎯 CREDENCIALES PARA LA APLICACIÓN:');
    console.log('===================================');
    console.log('🔑 Ana Felicidad (Admin): ana@spa.com / 123456');
    console.log('👩‍⚕️ María García: maria@spa.com / 123456');
    console.log('👨‍⚕️ Carlos Rodríguez: carlos@spa.com / 123456');
    console.log('👩‍⚕️ Lucía Wellness: lucia@spa.com / 123456');

    console.log('\n🔄 ACTUALIZA TU .env.local CON:');
    console.log(`MONGODB_URI=mongodb+srv://alan:123@cluster0.l7fqtuz.mongodb.net/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('🔐 Problema de autenticación');
      console.log('   - Verifica usuario "alan" y contraseña "123" en Atlas');
    }
    
    if (error.message.includes('IP not in whitelist')) {
      console.log('🌐 IP no autorizada - configura Network Access en Atlas');
    }
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

createUsersAtlas(); 