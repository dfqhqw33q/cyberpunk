import type React from "react"
import type { Metadata } from "next"
import { Roboto_Mono, Orbitron, Audiowide } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AudioProvider } from "@/components/cyberpunk/audio-provider"
import { BootWrapper } from "@/components/cyberpunk/boot-wrapper"
import "./globals.css"

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
})

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alert",
})

export const metadata: Metadata = {
  title: "CYBERAUTH // Secure Access Terminal",
  description: "Neural-linked authentication system",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${robotoMono.variable} ${orbitron.variable} ${audiowide.variable} font-sans antialiased bg-cyber-black min-h-screen`}
      >
        <AudioProvider>
          <BootWrapper>{children}</BootWrapper>
        </AudioProvider>
        <Analytics />
      </body>
    </html>
  )
}
