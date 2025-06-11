const { MongoClient, ObjectId } = require('mongodb');

async function createClientBookings() {
  const atlasUri = 'mongodb+srv://alan:123@cluster0.l7fqtuz.mongodb.net/spa-sentirse-bien?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(atlasUri);

  try {
    console.log('🔗 Conectando a MongoDB Atlas...');
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas');

    const db = client.db('spa-sentirse-bien');
    const bookingsCollection = db.collection('bookings');
    const usersCollection = db.collection('users');
    const servicesCollection = db.collection('services');

    // Obtener Ana (cliente)
    const ana = await usersCollection.findOne({ email: 'ana@spa.com' });
    if (!ana) {
      console.log('❌ No se encontró a Ana (ana@spa.com)');
      return;
    }

    // Obtener profesionales y servicios
    const professionals = await usersCollection.find({ role: 'professional' }).toArray();
    const services = await servicesCollection.find({}).toArray();

    console.log(`👤 Cliente encontrado: ${ana.firstName} ${ana.lastName}`);
    console.log(`👩‍⚕️ Encontrados ${professionals.length} profesionales`);
    console.log(`💆 Encontrados ${services.length} servicios`);

    // Eliminar citas existentes de Ana
    await bookingsCollection.deleteMany({ userId: ana._id.toString() });
    console.log('🧹 Citas existentes de Ana eliminadas');

    // Crear fechas: pasado (completadas), hoy, mañana, futuro
    const dates = [];
    
    // Cita pasada (completada)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);
    dates.push({ date: pastDate, status: 'completed' });
    
    // Cita de hoy (confirmada)
    const today = new Date();
    dates.push({ date: today, status: 'confirmed' });
    
    // Cita de mañana (confirmada)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dates.push({ date: tomorrow, status: 'confirmed' });
    
    // Cita futura (confirmada)
    const future = new Date();
    future.setDate(future.getDate() + 7);
    dates.push({ date: future, status: 'confirmed' });

    const clientBookings = [];

    dates.forEach((dateInfo, index) => {
      const randomService = services[index % services.length];
      const randomProfessional = professionals[index % professionals.length];
      const timeSlots = ['09:00', '10:30', '14:00', '15:30'];
      
      const booking = {
        userId: ana._id.toString(),
        userName: `${ana.firstName} ${ana.lastName}`,
        professionalId: new ObjectId(randomProfessional._id),
        professionalName: `${randomProfessional.firstName} ${randomProfessional.lastName}`,
        services: [{
          serviceId: new ObjectId(randomService._id),
          serviceName: randomService.name,
          servicePrice: randomService.price,
          serviceDuration: randomService.duration,
          serviceCategory: randomService.category,
          serviceSubcategory: randomService.subcategory
        }],
        date: new Date(dateInfo.date.getFullYear(), dateInfo.date.getMonth(), dateInfo.date.getDate()),
        timeSlot: timeSlots[index],
        status: dateInfo.status,
        payment: {
          amount: randomService.price,
          originalAmount: randomService.price,
          discount: 0,
          paid: Math.random() > 0.4, // 60% pagados
          receiptSent: Math.random() > 0.3, // 70% con comprobante enviado
        },
        notes: index === 2 ? 'Prefiere música relajante y temperatura ambiente' : undefined,
        reservedAt: new Date(Date.now() - (4 - index) * 24 * 60 * 60 * 1000), // Reservado días atrás
        canModify: dateInfo.status === 'confirmed' && dateInfo.date > new Date(),
        createdAt: new Date(Date.now() - (4 - index) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - (4 - index) * 24 * 60 * 60 * 1000)
      };

      clientBookings.push(booking);
    });

    console.log('📅 Insertando citas para Ana...');
    const result = await bookingsCollection.insertMany(clientBookings);
    console.log(`✅ ${result.insertedCount} citas de cliente creadas exitosamente!`);

    console.log('\n📊 CITAS CREADAS PARA ANA:');
    console.log('=========================');
    
    clientBookings.forEach((booking, index) => {
      const dateStr = booking.date.toLocaleDateString('es-ES');
      const statusEmoji = booking.status === 'completed' ? '✅' : 
                         booking.status === 'confirmed' ? '📋' : '❌';
      const paymentEmoji = booking.payment.paid ? '💳' : '⏳';
      
      console.log(`${index + 1}. ${statusEmoji} ${dateStr} ${booking.timeSlot} - ${booking.services[0].serviceName}`);
      console.log(`   👩‍⚕️ ${booking.professionalName}`);
      console.log(`   💰 ${booking.payment.amount.toLocaleString()} ARS ${paymentEmoji}`);
      console.log(`   📝 ${booking.notes || 'Sin notas'}`);
      console.log('');
    });

    console.log('🎯 RESUMEN:');
    console.log(`📝 Total citas: ${clientBookings.length}`);
    console.log(`✅ Completadas: ${clientBookings.filter(b => b.status === 'completed').length}`);
    console.log(`📋 Confirmadas: ${clientBookings.filter(b => b.status === 'confirmed').length}`);
    console.log(`💳 Pagadas: ${clientBookings.filter(b => b.payment.paid).length}`);
    console.log(`💰 Total pagado: $${clientBookings.filter(b => b.payment.paid).reduce((sum, b) => sum + b.payment.amount, 0).toLocaleString()}`);

    console.log('\n🚀 ¡Ahora Ana puede probar "Mis Citas"!');
    console.log('====================================');
    console.log('🔹 Inicia sesión con: ana@spa.com / 123456');
    console.log('🔹 Ve a "Mis Citas" en la navegación');
    console.log('🔹 Verás citas pasadas, presentes y futuras');
    console.log('🔹 Podrás cancelar las citas confirmadas');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

createClientBookings(); 