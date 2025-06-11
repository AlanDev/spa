const { MongoClient, ObjectId } = require('mongodb');

async function createSampleBookings() {
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

    // Obtener profesionales y servicios
    const professionals = await usersCollection.find({ role: 'professional' }).toArray();
    const services = await servicesCollection.find({}).toArray();

    if (professionals.length === 0) {
      console.log('❌ No se encontraron profesionales');
      return;
    }

    if (services.length === 0) {
      console.log('❌ No se encontraron servicios');
      return;
    }

    console.log(`👩‍⚕️ Encontrados ${professionals.length} profesionales`);
    console.log(`💆 Encontrados ${services.length} servicios`);

    // Limpiar citas existentes
    await bookingsCollection.deleteMany({});
    console.log('🧹 Citas existentes eliminadas');

    // Crear fechas para hoy, mañana y pasado mañana
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const dates = [today, tomorrow, dayAfterTomorrow];
    const timeSlots = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'];
    const clientNames = [
      'María González', 'Carlos López', 'Ana Martínez', 'Pedro Rodríguez',
      'Lucía Fernández', 'Diego Silva', 'Carmen Jiménez', 'Roberto Morales'
    ];

    const sampleBookings = [];

    // Crear citas para cada profesional en diferentes fechas
    professionals.forEach((professional, profIndex) => {
      dates.forEach((date, dateIndex) => {
        // Crear 2-4 citas por profesional por día
        const numBookings = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < numBookings; i++) {
          const randomService = services[Math.floor(Math.random() * services.length)];
          const randomTimeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
          const randomClient = clientNames[Math.floor(Math.random() * clientNames.length)];
          
          // Determinar estado basado en la fecha
          let status;
          if (dateIndex === 0) { // Hoy
            status = Math.random() > 0.3 ? 'completed' : 'confirmed';
          } else { // Futuro
            status = 'confirmed';
          }

          const booking = {
            userId: `user_${Math.random().toString(36).substr(2, 9)}`,
            userName: randomClient,
            professionalId: new ObjectId(professional._id),
            professionalName: `${professional.firstName} ${professional.lastName}`,
            services: [{
              serviceId: new ObjectId(randomService._id),
              serviceName: randomService.name,
              servicePrice: randomService.price,
              serviceDuration: randomService.duration,
              serviceCategory: randomService.category,
              serviceSubcategory: randomService.subcategory
            }],
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            timeSlot: randomTimeSlot,
            status: status,
            payment: {
              amount: randomService.price,
              originalAmount: randomService.price,
              discount: 0,
              paid: Math.random() > 0.3, // 70% pagados
              receiptSent: Math.random() > 0.2, // 80% con comprobante enviado
            },
            notes: Math.random() > 0.7 ? 'Cliente prefiere música relajante durante el tratamiento' : undefined,
            reservedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
            canModify: dateIndex > 0, // Solo futuras pueden modificarse
            createdAt: new Date(),
            updatedAt: new Date()
          };

          sampleBookings.push(booking);
        }
      });
    });

    console.log('📅 Insertando citas de prueba...');
    const result = await bookingsCollection.insertMany(sampleBookings);
    console.log(`✅ ${result.insertedCount} citas creadas exitosamente!`);

    // Mostrar resumen por profesional
    console.log('\n📊 RESUMEN DE CITAS CREADAS:');
    console.log('============================');
    
    for (const professional of professionals) {
      const professionalBookings = sampleBookings.filter(b => 
        b.professionalId.toString() === professional._id.toString()
      );
      
      console.log(`\n👩‍⚕️ ${professional.firstName} ${professional.lastName}:`);
      
      dates.forEach((date, index) => {
        const dateStr = index === 0 ? 'HOY' : index === 1 ? 'MAÑANA' : 'PASADO MAÑANA';
        const dayBookings = professionalBookings.filter(b => 
          b.date.toDateString() === date.toDateString()
        );
        
        console.log(`   📅 ${dateStr} (${date.toLocaleDateString()}): ${dayBookings.length} citas`);
        dayBookings.forEach(booking => {
          console.log(`      ⏰ ${booking.timeSlot} - ${booking.userName} (${booking.services[0].serviceName}) - ${booking.status}`);
        });
      });
    }

    console.log('\n🎯 ESTADÍSTICAS GENERALES:');
    console.log('=========================');
    console.log(`📝 Total de citas: ${sampleBookings.length}`);
    console.log(`💰 Ingresos totales: $${sampleBookings.reduce((total, b) => total + b.payment.amount, 0).toLocaleString()}`);
    console.log(`✅ Citas completadas: ${sampleBookings.filter(b => b.status === 'completed').length}`);
    console.log(`📋 Citas confirmadas: ${sampleBookings.filter(b => b.status === 'confirmed').length}`);
    console.log(`💳 Pagos realizados: ${sampleBookings.filter(b => b.payment.paid).length}`);

    console.log('\n🚀 ¡Citas de prueba creadas! Ahora puedes probar:');
    console.log('================================================');
    console.log('🔹 Página "Mi Agenda" - Ver citas por fecha');
    console.log('🔹 Página "Turnos Mañana" - Ver citas de mañana');
    console.log('🔹 Completar y cancelar citas');
    console.log('🔹 Ver resúmenes y estadísticas');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

createSampleBookings(); 