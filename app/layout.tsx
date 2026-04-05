import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "WeatherMap — Any City, Any Weather",
  description: "Beautiful map-poster style weather app powered by OpenStreetMap and Open-Meteo.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#010208" }}>{children}</body>
    </html>
  );
}
