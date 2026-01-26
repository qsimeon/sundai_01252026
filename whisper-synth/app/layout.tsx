import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Whisper Synth - Haunting Music Generator',
  description: 'Transform text into ethereal, vocal-like instrumental music',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-to-b from-gray-950 to-gray-900">
        {children}
      </body>
    </html>
  )
}
