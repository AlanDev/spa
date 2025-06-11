const { MongoClient } = require('mongodb');

async function checkAndCleanDatabase() {
  const atlasUri = 'mongodb+srv://alan:123@cluster0.l7fqtuz.mongodb.net/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(atlasUri);

  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    const db = client.db('spa-sentirse-bien');
    const bookingsCollection = db.collection('bookings');

    // Verificar el estado actual
    console.log('\n📊 VERIFICANDO ESTADO ACTUAL DE LA BASE DE DATOS:');
    console.log('=================================================');

    const totalBookings = await bookingsCollection.countDocuments();
    console.log(`📝 Total de reservas en la base: ${totalBookings}`);

    if (totalBookings > 0) {
      console.log('\n📋 Muestras de reservas encontradas:');
      const sampleBookings = await bookingsCollection.find().limit(5).toArray();
      sampleBookings.forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.userName} - ${booking.date} - ${booking.timeSlot} - ${booking.status}`);
      });

      console.log('\n🧹 ¿Deseas eliminar TODAS las reservas? (y/N)');
      console.log('ADVERTENCIA: Esta acción es irreversible!');
      
      // En lugar de esperar input, simplemente mostrar los datos
      console.log('\n📊 ESTADÍSTICAS POR ESTADO:');
      const byStatus = await bookingsCollection.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$payment.amount" }
          }
        }
      ]).toArray();
      
      byStatus.forEach(stat => {
        console.log(`- ${stat._id}: ${stat.count} citas, $${stat.totalRevenue || 0} ingresos`);
      });

      console.log('\n📅 ESTADÍSTICAS POR FECHA:');
      const byDate = await bookingsCollection.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();
      
      byDate.forEach(stat => {
        console.log(`- ${stat._id}: ${stat.count} citas`);
      });

    } else {
      console.log('✅ La base de datos está vacía - no hay reservas');
    }

    console.log('\n🔧 Para limpiar completamente, ejecuta:');
    console.log('node scripts/force-clean-db.js');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

checkAndCleanDatabase(); 