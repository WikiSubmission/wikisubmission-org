import "./globals.css";
import { Fonts } from "@/constants/fonts";
import { Metadata } from "@/constants/metadata";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import type { Viewport } from "next";
import { ScrollToTop } from "@/components/scroll-to-top";
import { GeometryDots } from "@/components/geometry-dots";

export const metadata = Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${Fonts.sora.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          <GeometryDots />
          {children}
          <ScrollToTop />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

// Prevent mobile browser zoom on input focus.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};