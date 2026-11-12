import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CIVIA — Your city, made understandable",
  description: "A mobile-first climate intelligence product concept. Understand local weather, air quality, and the signals behind contextual guidance.",
  applicationName: "CIVIA",
  openGraph: {
    title: "CIVIA — Your city, made understandable",
    description: "A calmer way to understand the environment around you.",
    type: "website"
  },
  icons: { icon: "/icon.svg" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a211d"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
