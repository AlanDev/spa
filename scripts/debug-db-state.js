const { MongoClient } = require('mongodb');

async function debugDatabaseState() {
  const atlasUri = 'mongodb+srv://alan:123@cluster0.l7fqtuz.mongodb.net/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(atlasUri);

  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    const db = client.db('spa-sentirse-bien');
    const bookingsCollection = db.collection('bookings');

    // Verificar el estado actual
    console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:');
    console.log('=====================================');

    const totalBookings = await bookingsCollection.countDocuments();
    console.log(`📝 Total de reservas en la base: ${totalBookings}`);

    if (totalBookings > 0) {
      console.log('\n📋 Últimas 10 reservas encontradas:');
      const recentBookings = await bookingsCollection.find().sort({ createdAt: -1 }).limit(10).toArray();
      recentBookings.forEach((booking, index) => {
        const date = booking.date ? new Date(booking.date).toLocaleDateString() : 'Sin fecha';
        console.log(`${index + 1}. ${booking.userName || 'Sin nombre'} - ${date} - ${booking.timeSlot || 'Sin hora'} - ${booking.status || 'Sin estado'}`);
      });

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
        console.log(`- ${stat._id || 'Sin estado'}: ${stat.count} citas, $${stat.totalRevenue || 0} ingresos`);
      });

      console.log('\n📅 RESERVAS POR FECHA (últimos 7 días):');
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const byDate = await bookingsCollection.aggregate([
        {
          $match: {
            date: { $gte: weekAgo, $lte: today }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]).toArray();
      
      if (byDate.length > 0) {
        byDate.forEach(stat => {
          console.log(`- ${stat._id}: ${stat.count} citas`);
        });
      } else {
        console.log('- No hay citas en los últimos 7 días');
      }

      // Verificar específicamente para hoy
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      
      const todayBookings = await bookingsCollection.find({
        date: { $gte: todayStart, $lte: todayEnd }
      }).toArray();
      
      console.log(`\n📅 CITAS PARA HOY (${today.toLocaleDateString()}): ${todayBookings.length}`);
      if (todayBookings.length > 0) {
        todayBookings.forEach(booking => {
          console.log(`   - ${booking.timeSlot} ${booking.userName} (${booking.status})`);
        });
      }

    } else {
      console.log('✅ La base de datos está vacía - no hay reservas');
      console.log('📝 Por eso las estadísticas deberían mostrar ceros');
    }

    console.log('\n🔧 VERIFICACIÓN COMPLETADA SIN MODIFICAR DATOS');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

debugDatabaseState(); 