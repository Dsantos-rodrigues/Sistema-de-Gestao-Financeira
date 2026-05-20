import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinFlow - Gestão Patrimonial Open Finance",
  description:
    "Plataforma de gestão patrimonial Open Finance. Análise de portfólio, fluxo de caixa e decisões de investimento em uma interface clara e poderosa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ink-800">{children}</body>
    </html>
  );
}
