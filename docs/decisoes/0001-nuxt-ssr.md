# 0001 — Nuxt 4 com SSR
- **Status:** aceita
- **Data:** 2026-10-16

## Contexto
O link compartilhado no WhatsApp precisa mostrar uma prévia com a primeira foto e uma mensagem. O robô do WhatsApp não executa JavaScript: as tags OG precisam vir no HTML do servidor. O dono do projeto é dev Vue.

## Decisão
Nuxt 4 (Vue 3, Composition API, TypeScript) com SSR. Os server routes do Nitro guardam a chave da API.

## Consequências
- OG funciona sem gambiarra em `/d/[id]`; o deploy natural é a Cloudflare (Workers + R2).
- Telas que dependem do navegador (wizard com IndexedDB) ficam em `<ClientOnly>`.
- Componentes registrados pelo nome do arquivo (`pathPrefix: false`): os nomes precisam ser únicos.
