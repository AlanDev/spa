import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Contacto</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            Información de Contacto
          </h2>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-purple-500 mr-4 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Dirección</h3>
                    <p className="text-gray-600">UTN Resistencia</p>
                    <p className="text-gray-600">
                      Resistencia, Chaco, Argentina
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-purple-500 mr-4 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Teléfono</h3>
                    <p className="text-gray-600">+54 3624 000000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-purple-500 mr-4 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email</h3>
                    <p className="text-gray-600">info@sentirsebien.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-purple-500 mr-4 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Horarios de Atención
                    </h3>
                    <p className="text-gray-600">
                      Lunes a Viernes: 9:00 - 19:00
                    </p>
                    <p className="text-gray-600">Sábados: 9:00 - 14:00</p>
                    <p className="text-gray-600">Domingos: Cerrado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-6">Ubicación</h2>
          <div className="h-[500px] bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3540.3282742033837!2d-58.98699548494!3d-27.451195982901384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94450c7e72219d77%3A0x86cac29b825c7f16!2sUniversidad%20Tecnol%C3%B3gica%20Nacional%20-%20Facultad%20Regional%20Resistencia!5e0!3m2!1ses-419!2sar!4v1650000000000!5m2!1ses-419!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
