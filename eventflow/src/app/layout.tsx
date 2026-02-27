import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import SessionProvider from "@/components/auth/SessionProvider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "EventFlow — Modern Event Management",
  description:
    "Create, manage, and grow your events with powerful tools for ticketing, QR check-in, analytics, and more.",
  keywords: ["events", "event management", "ticketing", "conference", "meetup"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-white`}>
        <SessionProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1E293B",
                border: "1px solid rgba(148, 163, 184, 0.1)",
                color: "#F1F5F9",
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
