import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/features/cash-flow/Toast";
import { SideNav } from "@/components/features/report/SideNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Household Financial Tracker",
  description: "Track your household finances with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full overflow-x-hidden">
        <SideNav />
        <ToastProvider>
          <main className="min-h-screen md:pl-16 transition-all duration-200">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
