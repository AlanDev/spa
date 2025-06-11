"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, CheckCircle, AlertCircle, Settings, Server } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface EmailConfig {
  configured: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  connectionValid: boolean;
  lastChecked: string;
}

export default function EmailTestPage() {
  const { isDraAnaFelicidad } = useAuth();
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    if (isDraAnaFelicidad) {
      fetchEmailConfig();
    }
  }, [isDraAnaFelicidad]);

  const fetchEmailConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await fetch("/api/test-email", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setEmailConfig(data.emailSystem);
      } else {
        toast({
          title: "Error",
          description: "No se pudo verificar la configuración de email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching email config:", error);
      toast({
        title: "Error",
        description: "Error al verificar configuración de email",
        variant: "destructive",
      });
    } finally {
      setConfigLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email para la prueba",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ testEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "¡Email enviado!",
          description: `Email de prueba enviado exitosamente a ${testEmail}`,
        });
        setTestEmail("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Error enviando email de prueba",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: "Error enviando email de prueba",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isDraAnaFelicidad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-gray-600 mt-2">
            Esta página es solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Mail className="h-8 w-8 text-purple-600" />
          Prueba de Sistema de Email
        </h1>
        <p className="text-gray-600 mt-2">
          Verifica y prueba el sistema de envío de emails de confirmación
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuración de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración SMTP
            </CardTitle>
          </CardHeader>
          <CardContent>
            {configLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Verificando configuración...</p>
              </div>
            ) : emailConfig ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado:</span>
                  {emailConfig.connectionValid ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error de conexión
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Servidor:</span>
                    <span className="text-sm font-medium">
                      {emailConfig.smtpHost}:{emailConfig.smtpPort}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usuario:</span>
                    <span className="text-sm font-medium">{emailConfig.smtpUser}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SSL/TLS:</span>
                    <span className="text-sm font-medium">STARTTLS</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Última verificación:</span>
                    <span className="text-sm font-medium">
                      {new Date(emailConfig.lastChecked).toLocaleString('es-ES')}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={fetchEmailConfig} 
                  variant="outline" 
                  className="w-full"
                  disabled={configLoading}
                >
                  <Server className="h-4 w-4 mr-2" />
                  Verificar Conexión
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">Error cargando configuración</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prueba de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Email de Prueba
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Email de destino</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="test@ejemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se enviará un email de confirmación de reserva de prueba
                </p>
              </div>

              <Button
                onClick={sendTestEmail}
                disabled={loading || !emailConfig?.connectionValid}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Email de Prueba
                  </>
                )}
              </Button>

              {!emailConfig?.connectionValid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      La conexión SMTP no está disponible
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Información del Sistema de Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">📧 Funcionalidades</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Confirmación automática de reservas</li>
                <li>✅ Templates HTML profesionales</li>
                <li>✅ Información completa de la cita</li>
                <li>✅ Detalles de contacto del spa</li>
                <li>✅ Enlaces a "Mis Reservas"</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">⚙️ Configuración Técnica</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>Proveedor:</strong> Gmail SMTP</li>
                <li><strong>Puerto:</strong> 587 (STARTTLS)</li>
                <li><strong>Autenticación:</strong> OAuth2/App Password</li>
                <li><strong>Codificación:</strong> UTF-8</li>
                <li><strong>Formato:</strong> HTML + Texto plano</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900">¿Cómo funciona?</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Cuando un cliente hace una reserva, automáticamente se envía un email de confirmación 
                  con todos los detalles de su cita. El sistema está integrado con la API de creación 
                  de reservas y funciona en tiempo real.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 