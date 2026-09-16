import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loê Clinic | Beleza que respeita a sua essência",
  description: "Loê Clinic — cuidado, beleza e bem-estar em uma experiência personalizada.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
