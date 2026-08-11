import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StoreProvider } from "@/context/StoreContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";
import "./globals.css";

// Let's configure custom metadata for humamanan Luxury Couture
export const metadata: Metadata = {
  title: "HUMA MANAN | Premium Handcrafted Bridal Wear, Lehengas & Sarees",
  description: "Experience Pakistan's finest luxury brand HUMA MANAN. Indulge in custom hand-embellished bridal lehengas, majestic Peshwas maxis, and royal tissue sarees.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#faf9f6] text-[#121212] antialiased selection:bg-[#ebdcb9] selection:text-[#121212]">
        <StoreProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CartSidebar />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
