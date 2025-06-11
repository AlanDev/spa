const { MongoClient } = require('mongodb');

async function cleanOnlyBookings() {
  const atlasUri = 'mongodb+srv://alan:123@cluster0.l7fqtuz.mongodb.net/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(atlasUri);

  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    const db = client.db('spa-sentirse-bien');
    
    // Verificar qué colecciones existen
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Colecciones en la base de datos:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });

    // Verificar datos ANTES de limpiar
    const bookingsCollection = db.collection('bookings');
    const usersCollection = db.collection('users');
    const servicesCollection = db.collection('services');

    const bookingsCount = await bookingsCollection.countDocuments();
    const usersCount = await usersCollection.countDocuments();
    const servicesCount = await servicesCollection.countDocuments();

    console.log('\n📊 ESTADO ANTES DE LIMPIAR:');
    console.log(`📅 Reservas (bookings): ${bookingsCount} - ESTAS SE VAN A ELIMINAR`);
    console.log(`👥 Usuarios/Profesionales: ${usersCount} - ESTOS SE MANTIENEN`);
    console.log(`💆 Servicios: ${servicesCount} - ESTOS SE MANTIENEN`);

    if (bookingsCount === 0) {
      console.log('\n✅ No hay reservas que eliminar - la base ya está limpia');
      return;
    }

    // Eliminar SOLO las reservas
    console.log('\n🧹 Eliminando ÚNICAMENTE las reservas...');
    const deleteResult = await bookingsCollection.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} reservas eliminadas`);

    // Verificar estado DESPUÉS de limpiar
    const bookingsAfter = await bookingsCollection.countDocuments();
    const usersAfter = await usersCollection.countDocuments();
    const servicesAfter = await servicesCollection.countDocuments();

    console.log('\n📊 ESTADO DESPUÉS DE LIMPIAR:');
    console.log(`📅 Reservas (bookings): ${bookingsAfter} ✅`);
    console.log(`👥 Usuarios/Profesionales: ${usersAfter} ✅ (sin cambios)`);
    console.log(`💆 Servicios: ${servicesAfter} ✅ (sin cambios)`);

    if (bookingsAfter === 0 && usersAfter > 0 && servicesAfter > 0) {
      console.log('\n🎉 ¡PERFECTO! Solo se eliminaron las reservas');
      console.log('📝 Los reportes ahora deberían mostrar estadísticas en cero');
      console.log('✅ Servicios y profesionales se mantuvieron intactos');
    } else {
      console.log('\n⚠️ Algo no salió como esperado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

cleanOnlyBookings(); 