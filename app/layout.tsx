import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "WeatherMap — Any City, Any Weather",
  description: "Map-poster style weather for any city in the world. Real road maps, live weather, 7 auto-switching themes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WeatherMap",
  },
  openGraph: {
    title: "WeatherMap",
    description: "Any city. Any weather. Anywhere.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#010208",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#010208", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
