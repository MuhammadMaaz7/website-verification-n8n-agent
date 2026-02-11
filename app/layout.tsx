import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Website Verification Agent | AI-Powered Brand Validation",
  description: "Validate website availability, detect redirects, and verify brand presence at scale with AI-powered analysis",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/icon.svg',
  },
  openGraph: {
    title: "Website Verification Agent",
    description: "AI-Powered Brand Validation & Website Verification",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=League+Spartan:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {children}
      </body>
    </html>
  );
}
