const { MongoClient } = require('mongodb');

async function resetUsers() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    
    // Verificar si la colección users existe
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length > 0) {
      console.log('🗑️ Eliminando colección users completa...');
      await db.collection('users').drop();
      console.log('✅ Colección users eliminada exitosamente');
    } else {
      console.log('ℹ️ La colección users no existe');
    }

    console.log('🎉 Reset de usuarios completado - la base de datos está limpia');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetUsers();
}

module.exports = { resetUsers }; 