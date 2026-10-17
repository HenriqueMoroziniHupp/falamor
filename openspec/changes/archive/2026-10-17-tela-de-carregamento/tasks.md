# Tasks

## 1. Tela de carregamento

- [x] 1.1 Criar `app/spa-loading-template.html` conforme o design (decisões 2 a 4): overlay fixo `.fl-loader` com o gradiente do envelope, coração em SVG inline com o path do `favicon.svg` em `#c8385e`, pulso lento em `transform`, entrada com fade e atraso, sem animação sob `prefers-reduced-motion`, `role="progressbar"` + `aria-label="Falamor"` e SVG com `aria-hidden`. Comentário em pt-BR apontando de onde vêm as cores. Verificar: o arquivo tem menos de 2 KB (`wc -c`).
- [x] 1.2 Adicionar em `PlayerCover.vue`, junto ao `background` do `.cover`, um comentário dizendo que `app/spa-loading-template.html` repete esse gradiente. Verificar: `npm run typecheck` passa.
- [x] 1.3 Criar `tests/unit/spaLoadingTemplate.test.ts`, que lê o arquivo com `fs` e verifica: nenhuma referência externa (`src=`, `href=`, `url(`, `@import`), presença de `prefers-reduced-motion`, `role="progressbar"`, `aria-label` e `aria-hidden` no SVG, e nenhum texto visível fora de `<style>`/`<svg>`. Verificar: `npx vitest run tests/unit/spaLoadingTemplate.test.ts` passa.

## 2. Documentação

- [x] 2.1 Criar `docs/decisoes/0012-tela-de-carregamento.md` no modelo do índice (contexto: tela branca do ADR 0011; decisão: template nativo, fundo igual ao envelope, remoção seca; consequências: CSS de entrada ainda bloqueia, JS que falha deixa o coração pulsando, manter as cores em sincronia com o `PlayerCover`). Adicionar a linha 0012 em `docs/decisoes/README.md`. Verificar: o link do índice abre o arquivo.
- [x] 2.2 Acrescentar à seção "Rendering (ADR 0011)" do `CLAUDE.md` uma frase sobre `app/spa-loading-template.html` (o que é, que ele é removido no `app:suspense:resolve` e que deve continuar sem recursos externos). Verificar: o texto cita o ADR 0012.

## 3. Verificação integrada

- [x] 3.1 Rodar `npm run build` e conferir que `.output/public/index.html` (landing pré-renderizada) **não** contém `__nuxt-loader`. Depois, com `npm run preview`, conferir que o HTML de `/d/demo` (via `curl`) contém `__nuxt-loader` e o coração, e que as tags OG injetadas pelo `og-meta.ts` continuam no `<head>`.
- [x] 3.2 No Chrome DevTools, com throttling "Slow 3G" e CPU 4x mais lenta, abrir `/d/demo`, `/en/d/demo-en`, `/d/demo-expirada`, `/d/nao-existe` e `/criar`. Verificar por screenshot ou gravação de performance: a primeira pintura já mostra o fundo blush e o coração (sem quadro branco), o coração pulsa durante o parse do JS, e a troca leva ao envelope, ao aviso de expirada, à página 404 e ao wizard, respectivamente, sem piscar branco.
- [x] 3.3 Repetir `/d/demo` emulando `prefers-reduced-motion: reduce`. Verificar: o coração fica parado.
- [x] 3.4 Rodar `npm test` e `npm run typecheck`. Verificar: tudo passa.
