import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@lib/theme-context";
import { Header } from "@components/marketing/Header";
import { Footer } from "@components/marketing/Footer";
import { getFlagValue } from "@lib/flags";

export const metadata: Metadata = {
  title: {
    default: "Elkis Realtor · 0% Comisión",
    template: "%s | Elkis Realtor",
  },
  description: "Arrienda departamentos con 0% de comisión. Compara, agenda visita y arrienda fácil.",
};

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

// Script para prevenir parpadeo inicial - aplica el tema guardado consistentemente
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var root = document.documentElement;
      
      // Remover clases de tema existentes
      root.classList.remove('dark', 'light');
      
      // Aplicar el tema guardado o light por defecto
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }
    } catch (e) {
      // En caso de error, aplicar light por defecto
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className="min-h-screen bg-bg text-text"
        suppressHydrationWarning={true}
      >
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Saltar al contenido principal
          </a>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-1 bg-background text-foreground" role="main">
              {children}
            </main>
            {getFlagValue('FOOTER_ENABLED') && <Footer />}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
