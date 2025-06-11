const { MongoClient } = require('mongodb');

async function testAtlasConnection() {
  console.log('🔧 DIAGNÓSTICO DE CONEXIÓN A MONGODB ATLAS');
  console.log('==========================================\n');

  // Diferentes combinaciones para probar
  const testConfigs = [
    {
      name: 'Configuración original',
      username: 'alan',
      password: '123',
      cluster: 'cluster0.l7fqtuz.mongodb.net'
    },
    {
      name: 'Sin especificar base de datos',
      username: 'alan', 
      password: '123',
      cluster: 'cluster0.l7fqtuz.mongodb.net',
      noDatabase: true
    },
    {
      name: 'Codificado para URL',
      username: encodeURIComponent('alan'),
      password: encodeURIComponent('123'),
      cluster: 'cluster0.l7fqtuz.mongodb.net'
    }
  ];

  for (const config of testConfigs) {
    console.log(`🧪 Probando: ${config.name}`);
    console.log(`   Usuario: ${config.username}`);
    console.log(`   Password: ${'*'.repeat(config.password.length)}`);
    
    let uri;
    if (config.noDatabase) {
      uri = `mongodb+srv://${config.username}:${config.password}@${config.cluster}/?retryWrites=true&w=majority&appName=Cluster0`;
    } else {
      uri = `mongodb+srv://${config.username}:${config.password}@${config.cluster}/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0`;
    }
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout más corto para pruebas
    });

    try {
      await client.connect();
      console.log('   ✅ CONEXIÓN EXITOSA!');
      
      // Probar listar bases de datos
      const adminDb = client.db().admin();
      const databases = await adminDb.listDatabases();
      console.log('   📚 Bases de datos disponibles:', databases.databases.map(db => db.name).join(', '));
      
      await client.close();
      console.log('   🔌 Conexión cerrada\n');
      return true; // Conexión exitosa, no seguir probando
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      
      if (error.message.includes('authentication failed')) {
        console.log('   🔐 Posibles causas:');
        console.log('      - Credenciales incorrectas');
        console.log('      - Usuario no creado en Atlas');
        console.log('      - Usuario sin permisos de base de datos');
      }
      
      if (error.message.includes('IP not in whitelist')) {
        console.log('   🌐 Tu IP no está en la whitelist');
        console.log('      - Ve a Network Access en MongoDB Atlas');
        console.log('      - Agrega tu IP actual o usa 0.0.0.0/0');
      }
      
      if (error.message.includes('Could not connect')) {
        console.log('   🔗 Problema de conectividad');
        console.log('      - Verifica tu conexión a internet');
        console.log('      - El cluster podría estar pausado');
      }
      
      try {
        await client.close();
      } catch (closeError) {
        // Ignorar errores al cerrar
      }
      console.log();
    }
  }

  console.log('\n📋 PASOS PARA SOLUCIONAR:');
  console.log('========================');
  console.log('1. 🔍 Ve a MongoDB Atlas → Database Access');
  console.log('2. 👤 Verifica que el usuario "alan" existe');
  console.log('3. 🔑 Verifica que la contraseña sea "123"');
  console.log('4. 🛡️ Asegúrate que tenga permisos de "Read and write to any database"');
  console.log('5. 🌐 Ve a Network Access → Agrega tu IP o usa 0.0.0.0/0');
  console.log('6. ⚡ Verifica que el cluster no esté pausado');
  
  console.log('\n🔄 Una vez solucionado, ejecuta:');
  console.log('   node scripts/create-users-atlas.js');
}

testAtlasConnection(); 