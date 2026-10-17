import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/i18n', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  // Componentes pelo nome do arquivo (sem prefixo da pasta): <DeclarationPlayer>, <StepPhotos>…
  components: [{ path: '~/components', pathPrefix: false }],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      title: 'Falamor',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#FFF7F8' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  // Tudo que é segredo fica fora de `public` e só existe no servidor (Nitro).
  // Cada chave pode ser sobrescrita por env: NUXT_GEMINI_API_KEY, NUXT_PUBLIC_SITE_URL…
  runtimeConfig: {
    geminiApiKey: '',
    ttsModel: 'gemini-3.8-flash-lite-tts',
    ttsVoiceFemale: 'Sulafat',
    ttsVoiceMale: 'Algieba',
    ttsRateLimitPerHour: 20,
    public: {
      siteUrl: 'http://localhost:3000',
      declarationTtlDays: 7,
      maxPhotos: 10,
      maxDeclarationChars: 1000,
    },
  },

  // Renderização (ADR 0011): só a landing é gerada no servidor, pré-renderizada no build, por SEO.
  // Todo o resto é montado no navegador. As tags OG de /d/** são injetadas por server/plugins/og-meta.ts.
  routeRules: {
    '/**': { ssr: false },
    '/': { ssr: true, prerender: true },
    '/en': { ssr: true, prerender: true },
    '/d/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/en/d/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },

  nitro: {
    // Piloto: cache de áudio em disco local. Pós-piloto: trocar o driver por R2
    // (unstorage `s3`/`cloudflare-r2-binding`) sem mudar o código que usa `useStorage('tts')`.
    storage: {
      tts: { driver: 'fs', base: './.data/tts' },
    },
  },

  i18n: {
    // Links hreflang/canonical absolutos (pode ser sobrescrito por NUXT_PUBLIC_I18N_BASE_URL).
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    defaultLocale: 'pt-BR',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'pt-BR', language: 'pt-BR', name: 'Português', file: 'pt-BR.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'falamor_lang',
      redirectOn: 'root',
    },
  },

  fonts: {
    families: [
      { name: 'Bodoni Moda', provider: 'google', weights: ['400 700'], styles: ['normal', 'italic'] },
      { name: 'Nunito', provider: 'google', weights: ['400 800'], styles: ['normal'] },
    ],
    defaults: { subsets: ['latin', 'latin-ext'] },
  },

  typescript: {
    tsConfig: {
      compilerOptions: { allowImportingTsExtensions: true },
    },
  },
})
