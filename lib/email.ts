import nodemailer from 'nodemailer';

// Configuración del transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para puerto 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER || "alanqienar@gmail.com",
    pass: process.env.SMTP_PASSWORD || "zliw jtay bfwh vbmc",
  },
});

interface BookingService {
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  serviceCategory: string;
}

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  services: BookingService[];
  date: Date;
  timeSlot: string;
  professionalName?: string;
  bookingId: string;
  totalAmount: number;
  notes?: string;
}

// Template HTML para el email
const createBookingEmailTemplate = (data: BookingEmailData): string => {
  const formattedDate = data.date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalDuration = data.services.reduce((total, service) => total + service.serviceDuration, 0);

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Reserva - Spa Sentirse Bien</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #8b5cf6, #ec4899);
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
            }
            .header p {
                margin: 10px 0 0 0;
                font-size: 16px;
                opacity: 0.95;
            }
            .content {
                padding: 30px 20px;
            }
            .booking-details {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #8b5cf6;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 600;
                color: #495057;
            }
            .detail-value {
                color: #212529;
                text-align: right;
            }
            .services-list {
                margin: 20px 0;
            }
            .service-item {
                background-color: #fff;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 15px;
                margin: 10px 0;
            }
            .service-name {
                font-weight: 600;
                color: #8b5cf6;
                font-size: 16px;
            }
            .service-details {
                color: #6c757d;
                font-size: 14px;
                margin-top: 5px;
            }
            .service-price {
                font-weight: 600;
                color: #28a745;
                float: right;
                font-size: 16px;
            }
            .total-section {
                background-color: #8b5cf6;
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .total-amount {
                font-size: 24px;
                font-weight: 700;
                margin: 10px 0;
            }
            .notes {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
            }
            .notes h4 {
                margin: 0 0 10px 0;
                color: #856404;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 14px;
                color: #6c757d;
            }
            .contact-info {
                margin: 20px 0;
                padding: 20px;
                background-color: #e8f5e8;
                border-radius: 8px;
            }
            .contact-info h4 {
                margin: 0 0 15px 0;
                color: #155724;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background-color: #8b5cf6;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 10px 0;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✨ Spa Sentirse Bien ✨</h1>
                <p>Confirmación de tu Reserva</p>
            </div>
            
            <div class="content">
                <h2>¡Hola ${data.customerName}! 👋</h2>
                <p>Nos complace confirmar tu reserva en nuestro spa. Aquí tienes todos los detalles:</p>
                
                <div class="booking-details">
                    <h3 style="margin-top: 0; color: #8b5cf6;">📅 Detalles de tu Cita</h3>
                    <div class="detail-row">
                        <span class="detail-label">📆 Fecha:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🕐 Hora:</span>
                        <span class="detail-value">${data.timeSlot}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">⏱️ Duración Total:</span>
                        <span class="detail-value">${totalDuration} minutos</span>
                    </div>
                    ${data.professionalName ? `
                    <div class="detail-row">
                        <span class="detail-label">👩‍⚕️ Profesional:</span>
                        <span class="detail-value">${data.professionalName}</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">🆔 Número de Reserva:</span>
                        <span class="detail-value">#${data.bookingId.slice(-8).toUpperCase()}</span>
                    </div>
                </div>

                <div class="services-list">
                    <h3 style="color: #8b5cf6;">💆‍♀️ Servicios Reservados</h3>
                    ${data.services.map(service => `
                        <div class="service-item">
                            <div class="service-name">${service.serviceName}</div>
                            <div class="service-price">$${service.servicePrice.toLocaleString()} ARS</div>
                            <div class="service-details">
                                ${service.serviceCategory} • ${service.serviceDuration} minutos
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="total-section">
                    <h3 style="margin: 0;">💰 Total a Pagar</h3>
                    <div class="total-amount">$${data.totalAmount.toLocaleString()} ARS</div>
                    <p style="margin: 0; opacity: 0.9;">El pago se realiza directamente en el spa</p>
                </div>

                ${data.notes ? `
                <div class="notes">
                    <h4>📝 Notas Especiales</h4>
                    <p>${data.notes}</p>
                </div>
                ` : ''}

                <div class="warning">
                    <strong>⚠️ Política de Cancelación:</strong><br>
                    Puedes cancelar o reprogramar tu cita hasta 48 horas antes sin costo adicional.
                </div>

                <div class="contact-info">
                    <h4>📞 Información de Contacto</h4>
                    <p><strong>Dirección:</strong> French 414, H3500 Resistencia, Chaco</p>
                    <p><strong>Teléfono:</strong> +54 11 1234-5678</p>
                    <p><strong>Email:</strong> info@sentirsebien.com</p>
                    <p><strong>Horarios:</strong> Lunes a Sábado de 9:00 a 20:00</p>
                </div>

                <p style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mis-reservas" class="btn">
                        Ver Mis Reservas
                    </a>
                </p>
            </div>
            
            <div class="footer">
                <p>Gracias por elegir Spa Sentirse Bien</p>
                <p>¡Esperamos verte pronto y brindarte una experiencia relajante única! 🌸</p>
                <p style="font-size: 12px; margin-top: 20px;">
                    Este es un email automático, por favor no respondas a este mensaje.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Función para enviar email de confirmación de reserva
export const sendBookingConfirmationEmail = async (data: BookingEmailData): Promise<boolean> => {
  try {
    const htmlContent = createBookingEmailTemplate(data);
    
    const mailOptions = {
      from: {
        name: 'Spa Sentirse Bien',
        address: process.env.SMTP_USER || "alanqienar@gmail.com"
      },
      to: data.customerEmail,
      subject: `✨ Confirmación de Reserva - Spa Sentirse Bien (#${data.bookingId.slice(-8).toUpperCase()})`,
      html: htmlContent,
      text: `
        Confirmación de Reserva - Spa Sentirse Bien
        
        Hola ${data.customerName},
        
        Tu reserva ha sido confirmada exitosamente.
        
        Detalles:
        - Fecha: ${data.date.toLocaleDateString('es-ES')}
        - Hora: ${data.timeSlot}
        - Servicios: ${data.services.map(s => s.serviceName).join(', ')}
        - Total: $${data.totalAmount.toLocaleString()} ARS
        - Número de reserva: #${data.bookingId.slice(-8).toUpperCase()}
        
        Nos vemos pronto en Spa Sentirse Bien!
        
        Contacto: +54 11 1234-5678
        Dirección: French 414, H3500 Resistencia, Chaco
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de confirmación enviado a: ${data.customerEmail}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    return false;
  }
};

// Función para verificar configuración de email
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Configuración de email verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en la configuración de email:', error);
    return false;
  }
}; 