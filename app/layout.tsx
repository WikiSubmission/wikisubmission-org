import "./globals.css";
import { Fonts } from "@/constants/fonts";
import { Metadata } from "@/constants/metadata";
import { ThemeProvider } from "@/components/theme-provider";
import type { Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata = Metadata;

export const runtime = 'edge';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${Fonts.sora.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
        >
          {children}
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