import type React from "react";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Spa Sentirse Bien",
  description: "Servicios de bienestar",
  icons: {
    icon: "🌸",
    shortcut: "🌸",
    apple: "🌸",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="es" className="light" style={{colorScheme: "light"}}>
        <body
          className={`${inter.className} bg-white min-h-screen flex flex-col`}
        >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
        </body>
      </html>
  );
}
