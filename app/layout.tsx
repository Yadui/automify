import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ModalProvider from "@/providers/modal-provider";
import { Toaster } from "sonner";
import { BillingProvider } from "@/providers/billing-provider";
import { ThemeClientWrapper } from "@/components/theme-client-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Automify",
    template: "%s | Automify",
  },
  description:
    "Automate your workflows with powerful integrations. Connect Google, Discord, Notion, Slack and more.",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Automify",
    description: "Automate your workflows with powerful integrations",
    siteName: "Automify",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeClientWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <BillingProvider>
              <ModalProvider>
                {children}
                <Toaster />
              </ModalProvider>
            </BillingProvider>
          </ThemeProvider>
        </ThemeClientWrapper>
      </body>
    </html>
  );
}
