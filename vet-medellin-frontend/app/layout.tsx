import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'
import '../styles/globals.css'
import { ToastProvider } from '@/context/toast-context'
import { CustomCursor } from '@/components/custom/custom-cursor'
import { Navbar } from '@/components/layout/navbar'
import { BackgroundInterpolation } from '@/components/layout/background-interpolation'

export const metadata: Metadata = {
  title: 'VetMedellin - Sistema de Gestion Veterinaria',
  description: 'Sistema integral de gestion para clinicas veterinarias. Administra citas, mascotas, historias clinicas, facturas y mas.',
  generator: 'v0.app',
  keywords: ['veterinaria', 'gestion', 'mascotas', 'citas', 'medellin', 'clinica'],
  authors: [{ name: 'VetMedellin' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased bg-background text-foreground">
        <ToastProvider>
          <Suspense fallback={null}>
            
              <CustomCursor />
              <BackgroundInterpolation>
                <Navbar />
                <main className="min-h-[calc(100vh-4rem)]">
                  {children}
                </main>
              </BackgroundInterpolation>
            
          </Suspense>
        </ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
