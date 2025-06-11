const { MongoClient } = require('mongodb');

async function forceCleanDatabase() {
  const atlasUri = 'mongodb+srv://alan:123@cluster0.l7fqtuz.mongodb.net/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(atlasUri);

  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    const db = client.db('spa-sentirse-bien');
    const bookingsCollection = db.collection('bookings');

    // Verificar estado antes de limpiar
    const beforeCount = await bookingsCollection.countDocuments();
    console.log(`📊 Reservas antes de limpiar: ${beforeCount}`);

    if (beforeCount === 0) {
      console.log('✅ La base de datos ya está limpia');
      return;
    }

    // Limpiar todas las reservas
    console.log('🧹 Eliminando TODAS las reservas...');
    const deleteResult = await bookingsCollection.deleteMany({});
    console.log(`✅ ${deleteResult.deletedCount} reservas eliminadas`);

    // Verificar estado después de limpiar
    const afterCount = await bookingsCollection.countDocuments();
    console.log(`📊 Reservas después de limpiar: ${afterCount}`);

    if (afterCount === 0) {
      console.log('🎉 Base de datos completamente limpia!');
      console.log('📝 Las estadísticas de reportes ahora deberían mostrar ceros');
    } else {
      console.log('⚠️ Aún hay algunas reservas - podría ser un problema de índices');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

forceCleanDatabase(); 