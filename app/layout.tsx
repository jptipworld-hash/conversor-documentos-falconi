
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "Conversor de Documentos Falconi",
  description: "Converta, edite e processe seus documentos de forma rápida e segura",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Conversor de Documentos Falconi",
    description: "Converta, edite e processe seus documentos de forma rápida e segura",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conversor de Documentos Falconi",
    description: "Converta, edite e processe seus documentos de forma rápida e segura",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
