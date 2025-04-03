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
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* call navbar.tsx file  and import the file */}
          {/* {showNavbar && <Navbar />} */}
          {/* <Navbar/> */}
          <main className="min-h-screen flex flex-col items-center">
          {children} {/* Render the page content */}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
