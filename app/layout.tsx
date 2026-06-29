import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eventus — Central de Eventos Universitários",
  description:
    "Plataforma oficial da universidade para eventos acadêmicos: palestras, oficinas, simpósios, congressos e muito mais. Encontre e inscreva-se nos eventos dos seus cursos.",
  keywords: [
    "eventos universitários",
    "congressos",
    "simpósios",
    "palestras",
    "universidade",
    "cursos",
    "acadêmico",
  ],
  authors: [{ name: "Eventus" }],
  icons: {
    icon: [
      { url: "/eventus.png", type: "image/png" },
    ],
    shortcut: "/eventus.png",
    apple: "/eventus.png",
  },
  openGraph: {
    title: "Eventus — Central de Eventos Universitários",
    description:
      "Sua central universitária de eventos: palestras, oficinas e congressos para todos os cursos.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1B3A6B" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1628" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${geistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
