import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Home } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Data Space for Industry 4.0",
  description: "Platform for data federation and sharing in Industry 4.0",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold text-xl">
              Data Space
            </Link>
            <Link href="/" className="flex items-center gap-2 hover:text-gray-300">
              <Home size={20} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
