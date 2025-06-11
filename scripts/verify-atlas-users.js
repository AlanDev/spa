const { MongoClient } = require('mongodb');

async function verifyAtlasUsers() {
  const atlasUri = 'mongodb+srv://alan:123@cluster0.l7fqtuz.mongodb.net/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(atlasUri);

  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado exitosamente');

    const db = client.db('spa-sentirse-bien');
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}).toArray();
    console.log(`\n📊 Total de usuarios: ${users.length}`);

    console.log('\n👤 Usuarios en Atlas:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`      📧 Email: ${user.email}`);
      console.log(`      🔐 Password (hash): ${user.password.substring(0, 20)}...`);
      console.log(`      👤 Role: ${user.role}`);
      console.log('');
    });

    // Buscar específicamente Ana
    const ana = await usersCollection.findOne({ email: 'ana@spa.com' });
    if (ana) {
      console.log('🔍 Usuario Ana encontrado:');
      console.log(`   📧 Email: ${ana.email}`);
      console.log(`   🔐 Password hash: ${ana.password}`);
      console.log(`   👤 Role: ${ana.role}`);
    } else {
      console.log('❌ Usuario Ana NO encontrado');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

verifyAtlasUsers(); 