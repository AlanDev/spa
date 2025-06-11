const { MongoClient, ObjectId } = require('mongodb');

async function createServices() {
  // Usar la misma URI de Atlas que está en .env.local
  const atlasUri = 'mongodb+srv://alan:123@cluster0.l7fqtuz.mongodb.net/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(atlasUri);

  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    const db = client.db('spa-sentirse-bien');
    const servicesCollection = db.collection('services');
    const usersCollection = db.collection('users');

    // Obtener IDs de profesionales
    const profesionales = await usersCollection.find({ role: 'professional' }).toArray();
    const profesionalIds = profesionales.map(p => p._id);

    console.log(`👩‍⚕️ Encontrados ${profesionales.length} profesionales`);

    // Limpiar servicios existentes
    await servicesCollection.deleteMany({});
    console.log('🧹 Servicios existentes eliminados');

    // Definir servicios con imágenes correspondientes
    const services = [
      // === TRATAMIENTOS FACIALES ===
      {
        name: "Limpieza Facial Profunda",
        description: "Tratamiento facial completo que incluye exfoliación, extracción de impurezas, mascarilla purificante y hidratación. Ideal para todo tipo de piel.",
        category: "Tratamientos Faciales",
        subcategory: "Limpieza",
        price: 8500,
        duration: 60,
        image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds,
        isActive: true,
        availableTimeSlots: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
        availableDays: [1, 2, 3, 4, 5, 6]
      },
      {
        name: "Tratamiento Anti-edad",
        description: "Tratamiento facial especializado para combatir los signos del envejecimiento con productos premium y técnicas avanzadas.",
        category: "Tratamientos Faciales",
        subcategory: "Anti-edad",
        price: 12500,
        duration: 90,
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds.slice(0, 2),
        isActive: true,
        availableTimeSlots: ["09:00", "11:00", "14:00", "16:00"],
        availableDays: [1, 2, 3, 4, 5]
      },
      {
        name: "Hidratación Facial",
        description: "Tratamiento hidratante intensivo para pieles secas y deshidratadas. Incluye mascarilla nutritiva y suero hidratante.",
        category: "Tratamientos Faciales",
        subcategory: "Hidratación",
        price: 7500,
        duration: 45,
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds,
        isActive: true,
        availableTimeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        availableDays: [1, 2, 3, 4, 5, 6]
      },

      // === MASAJES ===
      {
        name: "Masaje Relajante",
        description: "Masaje corporal completo para liberar tensiones y promover la relajación profunda. Ideal para reducir el estrés.",
        category: "Masajes",
        subcategory: "Relajante",
        price: 9500,
        duration: 60,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds,
        isActive: true,
        availableTimeSlots: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
        availableDays: [1, 2, 3, 4, 5, 6]
      },
      {
        name: "Masaje Terapéutico",
        description: "Masaje especializado para aliviar dolores musculares y mejorar la circulación. Recomendado para contracturas y tensiones.",
        category: "Masajes",
        subcategory: "Terapéutico",
        price: 11500,
        duration: 75,
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds.slice(0, 2),
        isActive: true,
        availableTimeSlots: ["09:00", "11:00", "14:00", "16:00"],
        availableDays: [1, 2, 3, 4, 5]
      },
      {
        name: "Masaje con Piedras Calientes",
        description: "Masaje relajante combinado con terapia de piedras calientes para una experiencia de bienestar único.",
        category: "Masajes",
        subcategory: "Relajante",
        price: 13500,
        duration: 90,
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds.slice(0, 1),
        isActive: true,
        availableTimeSlots: ["09:00", "11:30", "14:30"],
        availableDays: [1, 2, 3, 4, 5]
      },

      // === TRATAMIENTOS CORPORALES ===
      {
        name: "Exfoliación Corporal",
        description: "Exfoliación completa del cuerpo para eliminar células muertas y suavizar la piel. Incluye hidratación posterior.",
        category: "Tratamientos Corporales",
        subcategory: "Exfoliación",
        price: 8500,
        duration: 50,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds,
        isActive: true,
        availableTimeSlots: ["09:00", "10:30", "12:00", "14:00", "15:30"],
        availableDays: [1, 2, 3, 4, 5, 6]
      },
      {
        name: "Envoltura Corporal",
        description: "Tratamiento desintoxicante con arcillas y algas marinas para tonificar y nutrir la piel corporal.",
        category: "Tratamientos Corporales",
        subcategory: "Desintoxicante",
        price: 10500,
        duration: 75,
        image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds.slice(0, 2),
        isActive: true,
        availableTimeSlots: ["09:00", "11:00", "14:00", "16:00"],
        availableDays: [1, 2, 3, 4, 5]
      },

      // === BELLEZA ===
      {
        name: "Manicure Completa",
        description: "Cuidado completo de las uñas incluyendo limado, cutícula, hidratación y esmaltado con productos de alta calidad.",
        category: "Belleza",
        subcategory: "Manicure",
        price: 4500,
        duration: 45,
        image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds,
        isActive: true,
        availableTimeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
        availableDays: [1, 2, 3, 4, 5, 6]
      },
      {
        name: "Pedicure Spa",
        description: "Tratamiento completo para pies que incluye exfoliación, hidratación, masaje y esmaltado en un ambiente relajante.",
        category: "Belleza",
        subcategory: "Pedicure",
        price: 5500,
        duration: 60,
        image: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds,
        isActive: true,
        availableTimeSlots: ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"],
        availableDays: [1, 2, 3, 4, 5, 6]
      },

      // === WELLNESS ===
      {
        name: "Aromaterapia",
        description: "Sesión de relajación con aceites esenciales naturales para equilibrar mente, cuerpo y espíritu.",
        category: "Wellness",
        subcategory: "Relajación",
        price: 7500,
        duration: 45,
        image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds.slice(-1),
        isActive: true,
        availableTimeSlots: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
        availableDays: [1, 2, 3, 4, 5, 6]
      },
      {
        name: "Meditación Guiada",
        description: "Sesión de meditación y mindfulness para reducir el estrés y encontrar paz interior.",
        category: "Wellness",
        subcategory: "Meditación",
        price: 4500,
        duration: 30,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        professionals: profesionalIds.slice(-1),
        isActive: true,
        availableTimeSlots: ["08:00", "09:00", "18:00", "19:00"],
        availableDays: [1, 2, 3, 4, 5, 6, 0]
      }
    ];

    console.log('💆 Insertando servicios...');
    
    // Convertir ObjectIds a la inserción
    const servicesToInsert = services.map(service => ({
      ...service,
      professionals: service.professionals.map(id => new ObjectId(id)),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await servicesCollection.insertMany(servicesToInsert);
    console.log(`✅ ${result.insertedCount} servicios creados exitosamente!`);

    // Verificar y mostrar servicios creados
    const allServices = await servicesCollection.find({}).toArray();
    console.log(`\n📊 Total de servicios en la base de datos: ${allServices.length}`);

    console.log('\n🎯 SERVICIOS CREADOS:');
    console.log('==================');
    
    const servicesByCategory = allServices.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});

    Object.keys(servicesByCategory).forEach(category => {
      console.log(`\n📂 ${category.toUpperCase()}:`);
      servicesByCategory[category].forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.name} - $${service.price} (${service.duration} min)`);
      });
    });

    console.log('\n🖼️ IMÁGENES CONFIGURADAS:');
    console.log('========================');
    allServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name}`);
      console.log(`   🔗 ${service.image}`);
    });

    console.log('\n🎉 ¡Base de datos de servicios poblada exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

createServices(); 