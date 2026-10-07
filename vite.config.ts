import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import pacote from './package.json' with { type: 'json' }

export default defineConfig({
  // caminhos relativos: funciona em qualquer endereço (ex: GitHub Pages)
  base: './',
  define: {
    __VERSAO_APP__: JSON.stringify(pacote.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // os ícones já entram pela lista "globPatterns" abaixo; repetir aqui duplicaria arquivos
      // na lista do modo offline, e o service worker recusaria instalar
      includeManifestIcons: false,
      manifest: {
        name: 'Planilha de Vendas',
        short_name: 'Vendas',
        description: 'Controle de vendas, estoque, despesas e investimentos',
        lang: 'pt-BR',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F8FAFC',
        theme_color: '#0F172A',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico}'],
      },
    }),
  ],
})
