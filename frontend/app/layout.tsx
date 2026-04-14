import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CAMS | Chai Adda Management System",
  description: "Experience premium, real-time chai management and ordering. The ultimate solution for modern Chai Addas.",
  keywords: ["Chai", "Management", "Ordering", "Real-time", "CAMS"],
  authors: [{ name: "CAMS Team" }],
  openGraph: {
    type: "website",
    title: "CAMS | Chai Adda",
    description: "Real-time ordering and inventory management.",
    siteName: "Chai Adda Management System",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2B593F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
