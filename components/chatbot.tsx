"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatOption {
  id: string;
  text: string;
  response: string;
  followUp?: ChatOption[];
}

interface ServicesByCategory {
  [category: string]: {
    name: string;
    price: number;
    duration: number;
  }[];
}

interface BusinessConfig {
  name: string;
  description: string;
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
  };
  location: {
    address: string;
    city: string;
    province: string;
    details: string[];
  };
  businessHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  chatbotMessages: {
    welcome: string;
    servicesIntro: string;
    reservationInstructions: string;
    contactInfo: string;
    locationInfo: string;
  };
}

// Datos de fallback si fallan las APIs
const fallbackConfig = {
  name: "Spa Sentirse Bien",
  contact: {
    phone: "(3624) 123456",
    whatsapp: "(3624) 123456",
    email: "info@spasentirsebien.com"
  },
  location: {
    address: "French 414",
    city: "Resistencia",
    province: "Chaco",
    details: [
      "Universidad Tecnológica Nacional",
      "Facultad Regional Resistencia"
    ]
  },
  businessHours: {
    monday: { open: "09:00", close: "19:00", isOpen: true },
    tuesday: { open: "09:00", close: "19:00", isOpen: true },
    wednesday: { open: "09:00", close: "19:00", isOpen: true },
    thursday: { open: "09:00", close: "19:00", isOpen: true },
    friday: { open: "09:00", close: "19:00", isOpen: true },
    saturday: { open: "09:00", close: "18:00", isOpen: true },
    sunday: { open: "10:00", close: "17:00", isOpen: true }
  },
  chatbotMessages: {
    welcome: "¡Hola! 👋 Bienvenido/a a Spa Sentirse Bien. Soy tu asistente virtual y estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?",
    servicesIntro: "Ofrecemos una amplia gama de tratamientos de relajación y belleza. ¿Te interesa algún servicio en particular?",
    reservationInstructions: "Es muy fácil reservar tu cita:\n\n1️⃣ Regístrate en nuestra página\n2️⃣ Ve a la sección 'Servicios'\n3️⃣ Elige tu tratamiento favorito\n4️⃣ Selecciona fecha y hora\n5️⃣ ¡Confirma tu reserva!",
    contactInfo: "¡Estamos aquí para ayudarte! 💜",
    locationInfo: "¡Te esperamos en nuestro oasis de relajación!"
  }
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<ChatOption[]>([]);
  const [isInSubMenu, setIsInSubMenu] = useState(false);
  const [servicesData, setServicesData] = useState<ServicesByCategory>({});
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar datos al abrir el chat
  useEffect(() => {
    if (isOpen && isLoading) {
      loadChatbotData();
    }
  }, [isOpen]);

  const loadChatbotData = async () => {
    try {
      setIsLoading(true);
      
      // Establecer opciones básicas inmediatamente (SIEMPRE)
      const basicOptions = getBasicOptions();
      setCurrentOptions(basicOptions);
      
      // Establecer mensaje de bienvenida por defecto
      setMessages([{
        id: 1,
        text: fallbackConfig.chatbotMessages.welcome,
        isBot: true,
        timestamp: new Date()
      }]);

      // Intentar cargar datos de APIs
      try {
        const [configResponse, servicesResponse] = await Promise.all([
          fetch('/api/business-config'),
          fetch('/api/services')
        ]);

        // Cargar configuración si está disponible
        if (configResponse.ok) {
          const config = await configResponse.json();
          setBusinessConfig(config);
          
          // Actualizar mensaje de bienvenida con datos reales
          setMessages([{
            id: 1,
            text: config.chatbotMessages?.welcome || fallbackConfig.chatbotMessages.welcome,
            isBot: true,
            timestamp: new Date()
          }]);
        }

        // Cargar servicios si están disponibles
        if (servicesResponse.ok) {
          const services = await servicesResponse.json();
          setServicesData(services);
          
          // Actualizar opciones con servicios reales
          if (Object.keys(services).length > 0) {
            const updatedOptions = getBasicOptions(services);
            setCurrentOptions(updatedOptions);
          }
        }
        
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Las opciones básicas ya están establecidas, no hacemos nada más
      }
      
    } catch (error) {
      console.error('Error loading chatbot data:', error);
      // Incluso en caso de error total, mantenemos opciones básicas
      const basicOptions = getBasicOptions();
      setCurrentOptions(basicOptions);
      
      setMessages([{
        id: 1,
        text: "¡Hola! 👋 Hay algunos problemas cargando información, pero puedo ayudarte con lo básico.",
        isBot: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBasicOptions = (services?: ServicesByCategory): ChatOption[] => {
    const serviceOptions = services && Object.keys(services).length > 0 
      ? generateServiceOptions(services)
      : [];

    return [
      {
        id: "servicios",
        text: "🌸 ¿Qué servicios ofrecen?",
        response: "Cargando servicios...",
        followUp: serviceOptions
      },
      {
        id: "horarios",
        text: "🕐 ¿Cuáles son los horarios?",
        response: "Cargando horarios..."
      },
      {
        id: "reservas",
        text: "📅 ¿Cómo reservo una cita?",
        response: "Cargando información de reservas..."
      },
      {
        id: "precios",
        text: "💰 ¿Cuáles son los precios?",
        response: "Cargando precios actualizados..."
      },
      {
        id: "ubicacion",
        text: "📍 ¿Dónde están ubicados?",
        response: "Cargando información de ubicación..."
      },
      {
        id: "contacto",
        text: "📞 Información de contacto",
        response: "Cargando información de contacto..."
      }
    ];
  };

  const generateServiceOptions = (services: ServicesByCategory): ChatOption[] => {
    const categories = Object.keys(services);
    return categories.map(category => ({
      id: category.toLowerCase(),
      text: `${getCategoryIcon(category)} ${category}`,
      response: `Cargando precios de ${category.toLowerCase()}...`
    }));
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      'Masajes': '💆‍♀️',
      'Faciales': '✨',
      'Corporales': '🛁',
      'Manicura': '💅',
      'Depilación': '🦵',
      'Aromaterapia': '🌸'
    };
    return icons[category] || '🌟';
  };

  const formatBusinessHours = (): string => {
    const config = businessConfig || fallbackConfig;
    
    const dayNames: { [key: string]: string } = {
      monday: "Lunes",
      tuesday: "Martes", 
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    };

    let hoursText = "Nuestros horarios de atención son:\n\n";
    
    Object.entries(config.businessHours).forEach(([day, hours]) => {
      if (hours.isOpen) {
        hoursText += `📅 ${dayNames[day]}: ${hours.open} - ${hours.close}\n`;
      } else {
        hoursText += `📅 ${dayNames[day]}: Cerrado\n`;
      }
    });

    hoursText += "\n¡Estamos aquí para cuidarte!";
    return hoursText;
  };

  const formatLocationInfo = (): string => {
    const config = businessConfig || fallbackConfig;

    let locationText = "Nos encontramos en:\n\n";
    
    config.location.details.forEach(detail => {
      locationText += `📍 ${detail}\n`;
    });
    
    locationText += `📍 ${config.location.address}, ${config.location.city}, ${config.location.province}\n\n`;
    locationText += config.chatbotMessages?.locationInfo || fallbackConfig.chatbotMessages.locationInfo;
    
    return locationText;
  };

  const formatContactInfo = (): string => {
    const config = businessConfig || fallbackConfig;

    return `Contáctanos por cualquiera de estos medios:\n\n📞 Teléfono: ${config.contact.phone}\n📱 WhatsApp: ${config.contact.whatsapp}\n📧 Email: ${config.contact.email}\n📍 ${config.location.address}, ${config.location.city}\n\n${config.chatbotMessages?.contactInfo || fallbackConfig.chatbotMessages.contactInfo}`;
  };

  const formatReservationInfo = (): string => {
    const config = businessConfig || fallbackConfig;

    return `${config.chatbotMessages?.reservationInstructions || fallbackConfig.chatbotMessages.reservationInstructions}\n\nTambién puedes llamarnos al ${config.contact.phone} 📞`;
  };

  const formatServicesResponse = (category?: string) => {
    if (Object.keys(servicesData).length === 0) {
      return "Lo siento, no pude cargar los servicios en este momento. Sin embargo, ofrecemos una amplia gama de tratamientos:\n\n🌟 Masajes relajantes y terapéuticos\n🌟 Tratamientos faciales\n🌟 Tratamientos corporales\n🌟 Manicura y pedicura\n\nPara más información llámanos al (3624) 123456";
    }

    if (category) {
      const categoryServices = servicesData[category];
      if (!categoryServices || categoryServices.length === 0) {
        return `No hay servicios disponibles en la categoría ${category}.`;
      }

      let response = `Servicios de ${category}:\n\n`;
      categoryServices.forEach(service => {
        response += `• ${service.name} (${service.duration} min) - $${service.price.toLocaleString()}\n`;
      });
      response += "\n¿Quieres reservar alguno de estos servicios?";
      return response;
    } else {
      // Mostrar todos los servicios agrupados
      const config = businessConfig || fallbackConfig;
      let response = config.chatbotMessages?.servicesIntro || fallbackConfig.chatbotMessages.servicesIntro;
      response += "\n\n";
      
      Object.entries(servicesData).forEach(([category, services]) => {
        response += `🌟 ${category.toUpperCase()}\n`;
        services.forEach(service => {
          response += `• ${service.name} (${service.duration} min) - $${service.price.toLocaleString()}\n`;
        });
        response += "\n";
      });
      response += "¿Te interesa algún servicio en particular?";
      return response;
    }
  };

  const formatPricesResponse = () => {
    if (Object.keys(servicesData).length === 0) {
      return "Nuestros precios son muy competitivos:\n\n💆‍♀️ Masajes: desde $8,000\n✨ Faciales: desde $6,000\n💅 Manicura: desde $4,000\n\nPara precios exactos llámanos al (3624) 123456\n\n¡Consulta por nuestros paquetes especiales con descuentos!";
    }

    let response = "Nuestros precios actualizados:\n\n";
    Object.entries(servicesData).forEach(([category, services]) => {
      const minPrice = Math.min(...services.map(s => s.price));
      response += `${getCategoryIcon(category)} ${category}: desde $${minPrice.toLocaleString()}\n`;
    });
    response += "\n¡Consulta por nuestros paquetes especiales con descuentos!";
    return response;
  };

  const handleOptionClick = (option: ChatOption) => {
    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: Date.now(),
      text: option.text,
      isBot: false,
      timestamp: new Date()
    };

    let botResponse: string = option.response;

    // Generar respuestas dinámicas
    if (option.id === "servicios") {
      botResponse = formatServicesResponse();
    } else if (option.id === "precios") {
      botResponse = formatPricesResponse();
    } else if (option.id === "horarios") {
      botResponse = formatBusinessHours();
    } else if (option.id === "ubicacion") {
      botResponse = formatLocationInfo();
    } else if (option.id === "contacto") {
      botResponse = formatContactInfo();
    } else if (option.id === "reservas") {
      botResponse = formatReservationInfo();
    } else if (Object.keys(servicesData).some(cat => cat.toLowerCase() === option.id)) {
      // Es una categoría de servicios
      const category = Object.keys(servicesData).find(cat => cat.toLowerCase() === option.id);
      botResponse = formatServicesResponse(category);
    }

    // Agregar respuesta del bot
    const botMessage: Message = {
      id: Date.now() + 1,
      text: botResponse,
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);

    // Actualizar opciones - SIEMPRE mostrar opciones después de responder
    if (option.followUp && option.followUp.length > 0) {
      setCurrentOptions(option.followUp);
      setIsInSubMenu(true);
    } else {
      // Mostrar opciones principales después de responder
      setTimeout(() => {
        const mainOptions = getBasicOptions(servicesData);
        const quickActions = getQuickActions();
        setCurrentOptions([...quickActions, ...mainOptions]);
        setIsInSubMenu(false);
      }, 1500);
    }
  };

  const getQuickActions = (): ChatOption[] => [
    {
      id: "reservar_ahora",
      text: "🎯 Quiero reservar ahora",
      response: "¡Excelente decisión! Para reservar tu cita:\n\n✨ Ve a la sección 'Servicios' en el menú principal\n✨ O regístrate si aún no tienes cuenta\n\n¡Te esperamos! 💜",
    }
  ];

  const backToMainMenu = () => {
    const backMessage: Message = {
      id: Date.now(),
      text: "🏠 Volver al menú principal",
      isBot: false,
      timestamp: new Date()
    };

    const botResponse: Message = {
      id: Date.now() + 1,
      text: "¡Perfecto! ¿En qué más puedo ayudarte?",
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, backMessage, botResponse]);
    
    // Asegurar que se cargan las opciones principales correctamente
    const mainOptions = getBasicOptions(servicesData);
    const quickActions = getQuickActions();
    
    setCurrentOptions([...quickActions, ...mainOptions]);
    setIsInSubMenu(false);
  };

  const resetChat = () => {
    const config = businessConfig || fallbackConfig;
    setMessages([
      {
        id: 1,
        text: config.chatbotMessages?.welcome || fallbackConfig.chatbotMessages.welcome,
        isBot: true,
        timestamp: new Date()
      }
    ]);
    
    const mainOptions = getBasicOptions(servicesData);
    setCurrentOptions(mainOptions);
    setIsInSubMenu(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 h-14 w-14 md:h-16 md:w-16 rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg z-50 p-0 animate-pulse hover:animate-none"
          size="lg"
        >
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7 text-white" />
        </Button>
      )}

      {/* Ventana del chat - Responsive */}
      {isOpen && (
        <>
          {/* Overlay para móvil */}
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Chat window */}
          <Card className={`
            fixed z-50 flex flex-col shadow-2xl
            
            /* Móvil: pantalla completa */
            inset-x-0 bottom-0 top-0 mx-0 my-0 rounded-none
            
            /* Tablet y desktop: flotante en esquina inferior derecha */
            md:bottom-6 md:right-6 md:top-auto md:left-auto 
            md:w-80 md:h-[min(500px,80vh)] md:rounded-lg
          `}>
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white md:rounded-t-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-sm md:text-base">
                    {businessConfig?.name || fallbackConfig.name} - Asistente
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetChat}
                    className="text-white hover:bg-purple-600 h-8 w-8 p-0"
                    title="Reiniciar chat"
                  >
                    🔄
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-purple-600 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* Área de mensajes */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500 text-sm">Cargando...</div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${
                        message.isBot ? "justify-start" : "justify-end"
                      }`}
                    >
                      {message.isBot && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.isBot ? "order-2" : "order-1"}`}>
                        <div
                          className={`rounded-lg px-3 py-2 break-words text-sm ${
                            message.isBot
                              ? "bg-gray-100 text-gray-800"
                              : "bg-purple-500 text-white"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.text}</div>
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${
                          message.isBot ? "text-left" : "text-right"
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>

                      {!message.isBot && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1 order-2">
                          <User className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Botones de opciones - SIEMPRE mostrar si no está cargando */}
              {!isLoading && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {/* Botón de volver si estamos en submenú */}
                  {isInSubMenu && (
                    <Button
                      onClick={backToMainMenu}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-xs border-purple-200 hover:bg-purple-50"
                    >
                      <ArrowLeft className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">🏠 Volver al menú principal</span>
                    </Button>
                  )}

                  {/* Opciones actuales */}
                  {currentOptions.map((option) => (
                    <Button
                      key={option.id}
                      onClick={() => handleOptionClick(option)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-xs border-purple-200 hover:bg-purple-50"
                    >
                      <span className="truncate">{option.text}</span>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
} 