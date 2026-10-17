# 0012 — Tela de carregamento estática nas páginas montadas no navegador
- **Status:** aceita
- **Data:** 2026-10-17

## Contexto
- Desde o ADR 0011, `/d/[id]`, `/criar` e as rotas `/en/...` chegam com um `<div id="__nuxt">` vazio. A tela fica branca até baixar e executar uns 500 KB de JS e, na página pública, até a declaração chegar.
- Num celular lento em 3G isso leva vários segundos, e quem passa por isso é quem **recebe** o link: a primeira impressão parece link quebrado.

## Decisão
- `app/spa-loading-template.html`, o template nativo do Nuxt. Ele vai no HTML de casca dentro de `#__nuxt-loader` e é removido no `app:suspense:resolve`, que em `/d/[id]` só acontece depois do `await useFetch`. Não precisa configurar nada no `nuxt.config.ts`.
- O conteúdo é um fundo blush com um coração rosa pulsando, só com CSS e SVG inline e sem texto. Com "reduzir movimento", o coração fica parado. Para leitores de tela, `role="progressbar"` + `aria-label="Falamor"`.
- O fundo é **o mesmo gradiente do envelope** (`PlayerCover.vue`). Por isso a remoção é seca, sem fade nem JS extra: o envelope aparece sobre o mesmo fundo.

## Consequências
- Ninguém vê tela branca enquanto o JS carrega.
- O `entry.css` (~14 KB) no `<head>` ainda bloqueia a primeira pintura. A tela aparece depois de HTML + CSS, não só do HTML. Se pesar nos testes em aparelho real, tornar esse CSS não bloqueante.
- Se o JS falhar (rede caiu, navegador antigo), o coração pulsa para sempre. Não há mensagem de erro.
- As cores ficam escritas no template. Se mudar o gradiente do `PlayerCover` ou os tokens, mudar o template junto (há comentário nos dois lugares).
- O template deve continuar sem recursos externos: `tests/unit/spaLoadingTemplate.test.ts` verifica isso.
- No `nuxt dev`, editar o template pode exigir reiniciar o servidor.
