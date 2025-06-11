const { MongoClient } = require('mongodb');

async function cleanDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Listar índices existentes
    console.log('📋 Índices existentes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    // Eliminar el índice de clerkId si existe
    try {
      console.log('🗑️ Eliminando índice clerkId_1...');
      await usersCollection.dropIndex('clerkId_1');
      console.log('✅ Índice clerkId_1 eliminado exitosamente');
    } catch (error) {
      if (error.codeName === 'IndexNotFound') {
        console.log('ℹ️ El índice clerkId_1 no existe');
      } else {
        console.log('❌ Error al eliminar índice:', error.message);
      }
    }

    // Eliminar el campo clerkId de todos los documentos existentes
    console.log('🧹 Eliminando campo clerkId de documentos existentes...');
    const result = await usersCollection.updateMany(
      {},
      { $unset: { clerkId: "" } }
    );
    console.log(`✅ Campo clerkId eliminado de ${result.modifiedCount} documentos`);

    console.log('🎉 Limpieza de base de datos completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanDatabase();
}

module.exports = { cleanDatabase }; 