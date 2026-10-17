# Proposal

## Why

Desde o ADR 0011, tudo fora da landing (`/d/[id]`, `/criar`, `/en/...`) é montado no navegador. O HTML de casca chega com um `<div id="__nuxt">` vazio, e a tela fica branca até baixar e executar uns 500 KB de JS e, na página pública, até a declaração chegar de `/api/declarations/[id]`. Num celular lento em 3G, isso leva vários segundos. E quem abre o link pelo WhatsApp é justamente quem **recebe** a declaração: a primeira impressão do produto é uma tela branca, que parece link quebrado.

## What Changes

- Nova tela de carregamento estática em `app/spa-loading-template.html`: fundo blush (o mesmo papel do envelope), com um coração rosa pulsando devagar no centro.
- Ela vai no próprio HTML de casca, com CSS e SVG inline. Não depende de JS, fonte nem imagem externa, então aparece assim que o HTML (e o CSS de entrada, que já bloqueia a renderização hoje) chega.
- O Nuxt a remove sozinho quando o app termina de montar, incluindo o `await useFetch` da página pública. A pessoa passa direto da tela de carregamento para o envelope, sem piscar branco.
- Respeita "reduzir movimento": com `prefers-reduced-motion`, o coração fica parado.
- Sem texto visível (o HTML estático não sabe o idioma), mas com rótulo acessível neutro para leitores de tela.
- A landing (`/`, `/en`) não muda: é pré-renderizada e já chega com conteúdo.

Fora do escopo:
- Tornar o CSS de entrada não bloqueante ou fazer code splitting para baixar menos JS.
- Mensagem de "não carregou" quando o JS falha (rede caiu, navegador sem suporte). O coração continua pulsando; tratar isso fica para depois, se aparecer nos testes.

## Capabilities

### New Capabilities
- `carregamento-inicial`: o que a pessoa vê nas páginas montadas no navegador entre a chegada do HTML e o app estar pronto (aparência, quando aparece, quando sai, acessibilidade e movimento).

### Modified Capabilities
<!-- Nenhuma: ainda não há specs em openspec/specs/. -->

## Impact

- **Novo arquivo:** `app/spa-loading-template.html`. O Nuxt 4.6 já procura esse caminho por padrão; não precisa mexer no `nuxt.config.ts`.
- **Comportamento do Nuxt usado:** `experimental.spaLoadingTemplateLocation` vale `body` por padrão, então a tela vai num `<div id="__nuxt-loader">` irmão de `#__nuxt` e é removida no hook `app:suspense:resolve`.
- **Sem impacto** em `server/plugins/og-meta.ts`: as tags OG e o status 404/410 vão no `<head>`, e a tela vai no `<body>`.
- **Docs:** uma linha no ADR 0011 ou um ADR novo curto registrando a decisão, já que ela compensa um custo da renderização no navegador.
- Sem dependências novas, sem mudança de API.
