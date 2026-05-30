import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "material-symbols";
import AuthProvider from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FastDelivery — Domicilios rápidos y seguros",
  description:
    "Plataforma de domicilios que conecta clientes, restaurantes y repartidores. Pide tu comida favorita y recíbela en minutos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-background text-on-surface min-h-full flex flex-col">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
