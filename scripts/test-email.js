const { sendBookingConfirmationEmail, verifyEmailConfig } = require('../lib/email.ts');

async function testEmailSystem() {
  console.log('🧪 Probando sistema de email...');
  console.log('================================');

  // Verificar configuración
  console.log('1. Verificando configuración SMTP...');
  const configValid = await verifyEmailConfig();
  
  if (!configValid) {
    console.log('❌ Error en la configuración SMTP');
    return;
  }

  // Datos de prueba
  const testBookingData = {
    customerName: 'Ana Felicidad',
    customerEmail: 'alanqienar@gmail.com', // Cambiar por tu email para pruebas
    services: [
      {
        serviceName: 'Masaje Relajante',
        servicePrice: 9500,
        serviceDuration: 60,
        serviceCategory: 'Masajes'
      },
      {
        serviceName: 'Limpieza Facial',
        servicePrice: 8500,
        serviceDuration: 45,
        serviceCategory: 'Tratamientos Faciales'
      }
    ],
    date: new Date('2025-06-15'),
    timeSlot: '14:30',
    professionalName: 'María García',
    bookingId: '60b5d5f5e4b0f40015a5b5a5',
    totalAmount: 18000,
    notes: 'Cliente prefiere música relajante y temperatura ambiente cálida'
  };

  // Enviar email de prueba
  console.log('2. Enviando email de prueba...');
  try {
    const emailSent = await sendBookingConfirmationEmail(testBookingData);
    
    if (emailSent) {
      console.log('✅ Email de prueba enviado exitosamente!');
      console.log(`📧 Destinatario: ${testBookingData.customerEmail}`);
      console.log(`🎯 Asunto: Confirmación de Reserva - Spa Sentirse Bien (#${testBookingData.bookingId.slice(-8).toUpperCase()})`);
      console.log(`📅 Fecha de cita: ${testBookingData.date.toLocaleDateString('es-ES')}`);
      console.log(`🕐 Hora: ${testBookingData.timeSlot}`);
      console.log(`💰 Total: $${testBookingData.totalAmount.toLocaleString()} ARS`);
      console.log('');
      console.log('🎉 ¡El sistema de email está funcionando correctamente!');
      console.log('');
      console.log('📝 Próximos pasos:');
      console.log('• Revisa tu bandeja de entrada para ver el email');
      console.log('• Verifica que el formato sea el correcto');
      console.log('• Prueba hacer una reserva real desde la aplicación');
    } else {
      console.log('❌ Error enviando email de prueba');
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }

  console.log('');
  console.log('🔧 Configuración actual:');
  console.log(`• SMTP Host: smtp.gmail.com`);
  console.log(`• SMTP Port: 587`);
  console.log(`• Usuario: ${process.env.SMTP_USER || "alanqienar@gmail.com"}`);
  console.log(`• Password: ${process.env.SMTP_PASSWORD ? '[CONFIGURADO]' : 'zliw jtay bfwh vbmc [DEFAULT]'}`);
}

// Ejecutar prueba
testEmailSystem(); 