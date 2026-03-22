import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SnakeX — Cyberpunk Snake Game',
  description: 'Jogo da cobrinha moderno com mecânicas avançadas, skins e ranking',
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐍</text></svg>" },
}

export const viewport: Viewport = {
  themeColor: '#020408',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="scanline">
        {children}
      </body>
    </html>
  )
}
