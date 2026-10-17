# 0011 — Só a landing no servidor; o resto montado no navegador
- **Status:** aceita
- **Data:** 2026-10-17

## Contexto
- A landing precisa de HTML pronto para SEO.
- O wizard depende do IndexedDB e a página pública é um player interativo: nenhum dos dois ganha nada sendo renderizado no servidor.
- Na Cloudflare, o plano gratuito tem 10 ms de CPU por requisição. Renderizar Vue no servidor pode passar disso; arquivos estáticos são grátis e ilimitados.
- O preview do WhatsApp **exige** as tags OG no HTML do servidor, porque o robô não executa JavaScript.

## Decisão
Em `nuxt.config.ts` (`routeRules`):
- `/` e `/en`: **pré-renderizadas no build** (`prerender: true`). É HTML completo para SEO, servido como arquivo estático, sem CPU por acesso.
- Todo o resto (`/**`): `ssr: false`, montado no navegador. Isso vale também para páginas novas.
- `/d/[id]` continua montada no navegador. O plugin `server/plugins/og-meta.ts` injeta no HTML de casca:
  - o `<title>` e as tags OG/Twitter, com os textos de `i18n/locales/*.json` no idioma da declaração;
  - o status **404** (não existe) ou **410** (expirada).

  O plugin não renderiza Vue: lê o repositório e escreve algumas `<meta>`.

## Consequências
- SEO da landing garantido, e a maior parte do tráfego é estática.
- Mudou o texto da landing? É preciso novo build (é pré-renderizada). Se um dia ela tiver conteúdo dinâmico, trocar `prerender: true` por SSR a cada acesso.
- `useSeoMeta` em páginas SPA **não** aparece para robôs. Tags que precisam ser lidas por robôs vão no plugin do servidor.
- Os tipos do hook `render:html` no Nitro ainda descrevem o H3Event antigo, mas o Nuxt 4.6 entrega o evento no formato web. O plugin aceita os dois (`pathnameOf`, `setStatus`).
- No `nuxt dev` a landing é renderizada a cada acesso: a pré-renderização só acontece no `npm run build`.
