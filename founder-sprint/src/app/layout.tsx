import type { Metadata } from "next";
import "./globals.css";
import "./overrides.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: {
    default: "Founder Sprint | Outsome",
    template: "%s | Founder Sprint",
  },
  description: "Accelerating First-Time Founders. Join the Outsome founder community to connect, learn, and grow together.",
  metadataBase: new URL("https://bookface.outsome.co"),
  openGraph: {
    title: "Founder Sprint | Outsome",
    description: "Accelerating First-Time Founders. Join the Outsome founder community.",
    url: "https://bookface.outsome.co",
    siteName: "Founder Sprint",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Founder Sprint by Outsome",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Founder Sprint | Outsome",
    description: "Accelerating First-Time Founders.",
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://hyoawlhekcujihblbkkj.supabase.co"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://hyoawlhekcujihblbkkj.supabase.co"
        />
      </head>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
