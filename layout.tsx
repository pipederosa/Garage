import type { Metadata } from "next";
import "./globals.css";
import { AutoProvider } from "@/context/AutoContext";
import { Header } from "@/components/Header";
import { MobileNav, Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Garage · Gastos del auto",
  description: "Gestión de gastos y mantenimiento de autos sobre Google Sheets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AutoProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <MobileNav />
              <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</main>
            </div>
          </div>
        </AutoProvider>
      </body>
    </html>
  );
}
