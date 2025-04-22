import { Fira_Sans, Nunito } from  "next/font/google";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/ui/navbar";
// import { useEffect, useState } from "react";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

const firaSans = Fira_Sans({
  subsets: ["latin"],
  variable: "--font-fira",
  weight: ["400", "700"], // I probably should modify this
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "700"], // I probably should modify this
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // const [showNavbar, setShowNavbar] = useState(true);

  // useEffect(() => {
  //   if (window.location.pathname.startsWith("/sign-in")) {
  //     setShowNavbar(false);
  //   } else {
  //     setShowNavbar(true);
  //   }
  // }, []);
  return (
    <html 
      lang="en" 
      className={`${geistSans.className} ${firaSans.variable} ${nunito.variable}`} 
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        </ThemeProvider>
        <main>
          {children} {/* Render the page content */}
          </main>
      </body>
    </html>
  );
}
