const { MongoClient } = require('mongodb');

async function checkUsers() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 Conectando a MongoDB...');
    console.log('📍 URI:', uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db();
    console.log('📚 Base de datos:', db.databaseName);
    
    // Listar todas las colecciones
    const collections = await db.listCollections().toArray();
    console.log('📋 Colecciones encontradas:', collections.map(c => c.name));
    
    // Verificar la colección users específicamente
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Total de usuarios en la colección: ${userCount}`);
    
    if (userCount > 0) {
      console.log('👤 Usuarios encontrados:');
      const users = await usersCollection.find({}).toArray();
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Rol: ${user.role}`);
      });
    } else {
      console.log('❌ No se encontraron usuarios en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkUsers();
}

module.exports = { checkUsers }; 