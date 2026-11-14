import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { OrderModalProvider } from "@/context/OrderModalContext";
import { BulkEnquiryProvider } from "@/context/BulkEnquiryContext";
import Preloader from "@/components/Preloader";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://promectools.in"),
  title: "Aquaforce® 1400 | Cordless. Powerful. Portable.",
  description:
    "Wash your car anywhere with the Aquaforce® 1400 - a powerful, battery-powered portable pressure washer. No cables, no power socket, no fixed setup needed.",
  verification: {
    google: "chwYmglPbeV2UvIMJ7y1GhjaKnfr8xfIUUIvRl5ekmI",
  },
  icons: {
    icon: [
      { url: "/aquaforceforgigworkers/images/favicon.ico" },
      { url: "/aquaforceforgigworkers/favicon.ico" },
    ],
    shortcut: "/aquaforceforgigworkers/images/favicon.ico",
    apple: "/aquaforceforgigworkers/images/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtm.js?id=GTM-W9LLLTN9"
        />
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            `,
          }}
        />
        {/* Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
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
              fbq('init', '2138988830323885');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2138988830323885&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat+Alternates:wght@300;400;500;600;700;800;900&family=Montserrat:ital,wght@0,300..900;1,300..900&family=Open+Sans:wght@300;400;500;600;700;800&family=Unbounded:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes preloader-slide {
            0% { transform: translateX(-100%); opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { transform: translateX(260%); opacity: 0; }
          }
        ` }} />
      </head>
      <body className="antialiased font-sans">
        <Preloader />
        <OrderModalProvider>
          <BulkEnquiryProvider>{children}</BulkEnquiryProvider>
        </OrderModalProvider>
      </body>
    </html>
  );
}
