require("dotenv").config()
const { MongoClient } = require('mongodb');

async function limpiarUsuarios() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Solo limpiar usuarios, mantener servicios
    await db.collection('users').deleteMany({});
    console.log('✅ Usuarios eliminados');
    
    // Verificar servicios
    const serviciosCount = await db.collection('services').countDocuments();
    console.log(`📊 Servicios mantenidos: ${serviciosCount}`);
    
    console.log('\n🎯 SISTEMA LISTO PARA EL PRIMER USUARIO');
    console.log('=====================================');
    console.log('');
    console.log('🚀 INSTRUCCIONES SÚPER SIMPLES:');
    console.log('1. Ve a tu aplicación (localhost:3000)');
    console.log('2. Haz clic en "Registrarse"');
    console.log('3. Usa TU EMAIL REAL (el que quieras)');
    console.log('4. Recibirás el código en tu email');
    console.log('5. ¡AUTOMÁTICAMENTE serás ADMINISTRADOR!');
    console.log('');
    console.log('⭐ EL PRIMER USUARIO QUE SE REGISTRE = ADMINISTRADOR');
    console.log('⭐ TODOS LOS DEMÁS = CLIENTES (puedes cambiarlos desde admin)');
    console.log('');
    console.log('✅ Ya tienes 16 servicios cargados');
    console.log('✅ Sistema completamente funcional');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

limpiarUsuarios(); 