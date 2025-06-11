const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Usar la misma lógica que la aplicación
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spa-sentirse-bien';

console.log('🔍 URI que usará la aplicación:', MONGODB_URI);

async function createUsersAppConfig() {
  try {
    console.log('🔗 Conectando con la configuración de la aplicación...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado exitosamente');

    // Importar el modelo User de la aplicación
    const User = require('../models/user.ts').default;

    // Limpiar usuarios existentes
    await User.deleteMany({});
    console.log('🧹 Usuarios existentes eliminados');

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
        }
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
        }
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
        }
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
        }
      }
    ];

    console.log('👥 Creando usuarios...');
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ ${userData.firstName} ${userData.lastName} creado`);
    }

    console.log('\n🎉 Usuarios creados exitosamente!');
    console.log('\n📋 CREDENCIALES:');
    console.log('Ana Felicidad: ana@spa.com / 123456');
    console.log('María García: maria@spa.com / 123456');
    console.log('Carlos Rodríguez: carlos@spa.com / 123456');
    console.log('Lucía Wellness: lucia@spa.com / 123456');

    // Verificar que se crearon
    const count = await User.countDocuments();
    console.log(`\n✅ Total de usuarios en la base de datos: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createUsersAppConfig(); 