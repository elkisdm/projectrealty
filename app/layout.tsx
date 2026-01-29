import type { Metadata } from "next";
import { Inter, Mona_Sans, Hubot_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@lib/theme-context";
import { Header } from "@components/marketing/Header";
import { ConditionalFooter } from "@components/ConditionalFooter";
import { getFlagValue } from "@lib/flags";
import { getBaseUrl } from "@lib/seo/metadata";
import Providers from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
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
  variable: "--font-inter",
});

const monaSans = Mona_Sans({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: "--font-mona-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const hubotSans = Hubot_Sans({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: "--font-hubot-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
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
    <html
      lang="es"
      className={`${inter.variable} ${monaSans.variable} ${hubotSans.variable} ${inter.className}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        {/* Meta Pixel */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body
        className="min-h-screen bg-bg text-text"
        suppressHydrationWarning={true}
      >
        <ThemeProvider>
          <Providers>
            <a href="#main-content" className="skip-link">
              Saltar al contenido principal
            </a>
            <div className="flex flex-col min-h-screen">
              {getFlagValue('HEADER_ENABLED') && <Header />}
              <main id="main-content" className="flex-1 bg-background text-foreground" role="main">
                {children}
              </main>
              {getFlagValue('FOOTER_ENABLED') && <ConditionalFooter />}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
