import "./globals.css";
import { Fonts } from "@/constants/fonts";
import { Metadata } from "@/constants/metadata";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTop } from "@/components/scroll-to-top";
import { GeometryDots } from "@/components/geometry-dots";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import type { Viewport } from "next";

export const metadata = Metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInUrl="/auth/sign-in" signUpUrl="/auth/sign-up">
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${Fonts.sora.className} ${Fonts.amiri.variable} antialiased break-words`}
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
    </ClerkProvider>
  );
}

// Prevent mobile browser zoom on input focus.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};