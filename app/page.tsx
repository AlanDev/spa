import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import ChatBot from "@/components/chatbot";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Bienestar</span>
                <span className="block text-purple-500">Relajacion</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                En Spa Sentirse Bien, ofrecemos una variedad de servicios
                diseñados para ayudarte a relajarte y rejuvenecer. Desde masajes
                hasta tratamientos faciales, tenemos todo lo que necesitas para
                sentirte bien.
              </p>
              <div className="mt-8">
                <Link href="/servicios">
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    Ver Servicios
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-64 md:h-96">
              <Image
                src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.istockphoto.com%2Fid%2F643931726%2Fes%2Ffoto%2Fel-entorno-de-spa-morado.jpg%3Fs%3D170667a%26w%3D0%26k%3D20%26c%3DOCNKmsPaUYH5NrtHQWXjCsBAkYRjwHqDyUJdXjpBE6Y%3D&f=1&nofb=1&ipt=9e0272e11fec088ac4cdbccf21a3be6747c706594c63bb8cc1cff36f46f751d0"
                alt="Sentirse Bien"
                fill
                className="object-cover rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Nuestros Servicios
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Ofrecemos una amplia gama de servicios para tu bienestar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-purple-500 text-xl font-semibold">
                    M
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Masajes</h3>
                <p className="text-gray-600">
                  Masajes anti-stress, descontracturantes y más para tu
                  relajación.
                </p>
                <div className=" w-auto  rounded-lg flex items-center justify-center mb-4">
                  <img className="rounded-lg  h-40 w-60" src="https://imgs.search.brave.com/evpVTs0QMrMcjHyi1OGIbh5oCBtoCD6oHpioS590Cos/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMuc3BhbG9waWEu/YXBwL2UwNzJmMzRk/LTIwMzEtNTRjMS04/YzU2LWQyYTYxYWFk/MzEzNC9zM2ZzLXB1/YmxpYy9tYXNhamVf/Ny5qcGc" alt="" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-purple-500 text-xl font-semibold">
                    B
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Belleza</h3>
                <p className="text-gray-600">
                  Servicios de belleza para realzar tu imagen y autoestima.
                </p>
                <div className=" w-auto  rounded-lg flex items-center justify-center mb-4">
                  <img className="rounded-lg  h-40 w-60" src="https://imgs.search.brave.com/T7ypPNie_CCVlnC-2WgRKUgkVKl9Xm9EqtwkI-i2pgQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/bXNjY3J1Y2Vyb3Mu/Y29tLmFyLy0vbWVk/aWEvZ2xvYmFsLWNv/bnRlbnRzL29uLWJv/YXJkL3NwYS1iZWF1/dHktYW5kLWZpdG5l/c3Mvc3BhL3RpbGUt/aW1hZ2VzL2hhaXIt/c2Fsb24uanBnP2Jj/PXRyYW5zcGFyZW50/JmFzPTEmbWg9MTA4/MCZtdz0xMzgwJmhh/c2g9RkEwNzc3MzAw/MUMxNjIxNDBFREUx/MUI2RDM3ODNBQUE" alt="" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-purple-500 text-xl font-semibold">
                    F
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Tratamientos Faciales
                </h3>
                <p className="text-gray-600">
                  Tratamientos para rejuvenecer y mejorar la apariencia de tu
                  piel.
                </p>
                <div className=" w-auto  rounded-lg flex items-center justify-center mb-4">
                  <img className="rounded-lg h-40 w-60" src="https://imgs.search.brave.com/0R2Lbqp0-f8tXbq9r19ge9zhUQWsOS3jOudTHkLOMAg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9oZWxh/c3BhbWV4aWNvLmNv/bS9jZG4vc2hvcC9w/cm9kdWN0cy9GYWNp/YWxsaW1waWV6YXBy/b2Z1bmRhXzE2MDB4/LmpwZz92PTE2MjY5/Mjc3MTg" alt="" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-purple-500 text-xl font-semibold">
                    C
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Tratamientos Corporales
                </h3>
                <p className="text-gray-600">
                  Tratamientos para mejorar la apariencia y salud de tu cuerpo.
                </p>
                <div className=" w-auto  rounded-lg flex items-center justify-center mb-4">
                  <img className="rounded-lg h-40 w-60" src="https://imgs.search.brave.com/QgtkPrbwMztvGBf6dZc7f4RvDy2PcpewMC3lhPYz5hQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9rYW1h/aXNwYS5jb20vd3At/Y29udGVudC91cGxv/YWRzLzIwMjQvMTIv/OC10aXBvcy1kZS1t/YXNhamVzLWNvcnBv/cmFsZXMuanBn" alt="" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-10">
            <Link href="/servicios">
              <Button
                variant="outline"
                className="border-purple-500 text-purple-500 hover:bg-purple-50"
              >
                Ver todos los servicios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Lo que dicen nuestros clientes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Experiencias de quienes han disfrutado de nuestros servicios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex text-yellow-400 mb-4">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-gray-600 mb-4">
                  "Los masajes anti-stress son increíbles. Me ayudaron a reducir
                  la tensión acumulada por el trabajo."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3">
                    <img
                      className="rounded-full h-10 w-10"
                      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.freejpg.com.ar%2Fasset%2F900%2F9c%2F9cbc%2FF100012424.jpg&f=1&nofb=1&ipt=8299aeb387a1b37bfb1878fcdb3e4e968aa2327ee2ee3956fe7ecfc4ac8ff126"
                      alt=""
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">María García</h4>
                    <p className="text-sm text-gray-500">Cliente desde 2022</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex text-yellow-400 mb-4">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-gray-600 mb-4">
                  "El tratamiento facial de limpieza profunda dejó mi piel
                  radiante. Volveré pronto para otro tratamiento."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3">
                    <img
                      className="rounded-full h-10 w-10"
                      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.rawpixel.com%2Fs3fs-private%2Frawpixel_images%2Fwebsite_content%2F279-pai1579-nam.jpg%3Fw%3D1300%26dpr%3D1%26fit%3Ddefault%26crop%3Ddefault%26q%3D80%26vib%3D3%26con%3D3%26usm%3D15%26bg%3DF4F4F3%26ixlib%3Djs-2.2.1%26s%3D9095de2c69f3fc269577e9cf6c39f6b7&f=1&nofb=1&ipt=804d2478ed2aba8f4c846725f79b9c0af823f3f0d9bde45e2dc2a96a8daea1bc"
                      alt=""
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Carlos Rodríguez</h4>
                    <p className="text-sm text-gray-500">Cliente desde 2023</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex text-yellow-400 mb-4">
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                  <Star className="h-5 w-5 fill-current" />
                </div>
                <p className="text-gray-600 mb-4">
                  "Las clases de yoga son excelentes. La instructora es muy
                  profesional y el ambiente es muy relajante."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3">
                    <img
                      className="rounded-full h-10 w-10"
                      src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fhips.hearstapps.com%2Fellees.h-cdn.co%2Fassets%2F15%2F37%2F1024x1332%2F1024x1332-por-ti-rostros-activos-personas-luchadoras-12718597-1-esl-es-rostros-activos-personas-luchadoras-jpg.jpg%3Fresize%3D768%3A*&f=1&nofb=1&ipt=bc3e9e1bc92691c75011917e36215cf7bc174ab9451cce16a2ef46f3b60992b9"
                      alt=""
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">Laura Martínez</h4>
                    <p className="text-sm text-gray-500">Cliente desde 2021</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para una experiencia de bienestar?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Reserva tu cita hoy y comienza tu camino hacia el bienestar y la
            relajación.
          </p>
          <Link href="/servicios">
            <Button className="bg-white text-purple-500 hover:bg-gray-100">
              Reservar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* ChatBot flotante */}
      <ChatBot />
    </div>
  );
}
