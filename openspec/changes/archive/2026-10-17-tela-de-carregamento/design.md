# Design

## Context

Motivação em `proposal.md`; comportamento esperado em `specs/carregamento-inicial/spec.md`.

O que foi verificado no código (Nuxt 4.6.1):

- `@nuxt/nitro-server` procura `app/spa-loading-template.html` em cada layer e embute o conteúdo no HTML de casca das rotas `ssr: false`. Não precisa configurar nada no `nuxt.config.ts`.
- `experimental.spaLoadingTemplateLocation` vale `body` por padrão. A casca fica `<div id="__nuxt"></div><div id="__nuxt-loader">…template…</div>`, e o `entry.js` faz `document.getElementById('__nuxt-loader')?.remove()` no hook `app:suspense:resolve`.
- `/d/[id].vue` faz `await useFetch(...)` no `setup`, então o `suspense:resolve` só dispara depois que a declaração chega (ou dá erro). A tela cobre o download do JS **e** a busca dos dados.
- Rotas pré-renderizadas (`/`, `/en`) passam pelo renderer SSR, que não usa o template.
- O HTML de casca já tem `<link rel="stylesheet" href="/_nuxt/entry.*.css">` no `<head>` (14 KB no build atual). Ele bloqueia a primeira pintura. O JS somado tem uns 500 KB, e o maior chunk passa de 200 KB.
- O envelope (`PlayerCover.vue`) usa `radial-gradient(circle at 50% 28%, #fff 0%, var(--color-paper) 42%, var(--color-petal) 100%)`. O `theme-color` é `#FFF7F8` e o coração do `favicon.svg` é `#c8385e`.

## Goals / Non-Goals

**Goals:**
- A tela aparece na primeira pintura possível da casca e continua animando enquanto o JS é processado.
- A troca para o envelope não tem corte perceptível.
- O arquivo é pequeno (alvo: menos de 2 KB) e não faz nenhuma requisição.

**Non-Goals:**
- Mudar a ordem ou o bloqueio do CSS de entrada no `<head>`.
- Animar a saída da tela com JS (ver decisão 3).
- Mostrar progresso real do download.

## Decisions

### 1. Usar o template nativo do Nuxt, sem configuração
Basta criar `app/spa-loading-template.html` e manter `spaLoadingTemplateLocation` no padrão `body`.
- *Alternativa:* um componente Vue de "loading" dentro do app. Rejeitada porque só aparece depois que o JS roda, que é justamente o problema.
- *Alternativa:* injetar o HTML pelo `server/plugins/og-meta.ts`. Rejeitada porque o Nuxt já resolve isso e cuida da remoção.

### 2. Overlay fixo com CSS e SVG inline, animando só `transform` e `opacity`
O conteúdo é um `<style>` e um bloco com `position: fixed; inset: 0; z-index` alto, com o coração em SVG inline (mesmo path do `favicon.svg`). As classes ficam sob um prefixo próprio (ex.: `.fl-loader`) para não colidir com o Tailwind nem com os estilos dos componentes.
- O overlay fixo cobre a tela mesmo que algo seja montado em `#__nuxt` antes do `suspense:resolve`.
- Animações de `transform`/`opacity` rodam na thread do compositor e continuam suaves enquanto a thread principal está ocupada fazendo parse do JS, que é exatamente o momento em que a tela está visível num celular lento.
- O pulso é um "tum-tum" lento (ciclo de uns 1,6 s, escala pequena). Em `@media (prefers-reduced-motion: reduce)`, sem animação.
- O coração entra com um fade de ~0,3 s e um pequeno atraso. Em conexão rápida, a pessoa vê só o fundo blush por um instante, sem um coração piscando.
- Não usa variáveis do `main.css`: as cores ficam escritas no próprio arquivo, porque o template precisa funcionar mesmo isolado. Um comentário aponta de onde elas vêm.

### 3. Fundo idêntico ao do envelope, remoção seca
O fundo repete o gradiente do `PlayerCover`. Quando o Nuxt remove o loader com `.remove()`, quem está em `/d/[id]` vê o mesmo fundo, e o envelope aparece por cima. Por isso não precisa de fade de saída.
- *Alternativa:* um plugin client-only que, no `app:suspense:resolve`, aplica uma classe de fade antes de remover. Rejeitada no piloto: é JS a mais e uma corrida com a remoção nativa, para um ganho pequeno.
- Em `/criar` e nas páginas de erro, o fundo do app é `--color-paper` (no `body`). A troca vai de gradiente blush para papel blush, sem branco.

### 4. Acessibilidade sem idioma
O container recebe `role="progressbar"` (indeterminado, sem `aria-valuenow`) e `aria-label="Falamor"`. O SVG recebe `aria-hidden="true"` e `focusable="false"`. O leitor de tela anuncia "ocupado/carregando" no idioma do próprio aparelho, então não precisamos saber o idioma da rota no HTML estático.
- *Alternativa:* `aria-label` bilíngue ("Carregando / Loading"). Rejeitada por ser verboso e não escalar para um terceiro idioma.

### 5. Registrar em ADR
Criar `docs/decisoes/0012-tela-de-carregamento.md`, uma decisão curta que compensa um custo do ADR 0011, e citá-la no índice das ADRs e na seção de renderização do `CLAUDE.md`.

## Risks / Trade-offs

- **[CSS de entrada bloqueia a pintura]** A tela só aparece depois de HTML + `entry.css` (~14 KB), não só do HTML. → Ainda é muito antes dos ~500 KB de JS. Tornar o CSS não bloqueante fica para outra mudança, se os testes em aparelho real mostrarem que pesa.
- **[JS falha e o coração pulsa para sempre]** Rede caiu ou navegador antigo demais. → Fora de escopo (ver proposta). Anotar nos testes de aparelhos reais do ROADMAP.
- **[Divergência de cor]** Se o gradiente do envelope ou os tokens mudarem, o loader fica desalinhado. → Comentário nos dois lugares apontando um para o outro.
- **[Mudança de comportamento do Nuxt]** Um upgrade pode mudar o padrão de `spaLoadingTemplateLocation` ou o nome do id. → O teste unitário verifica o arquivo, e a checagem manual após o build verifica a casca. Se mudar, fixar `experimental.spaLoadingTemplateLocation: 'body'` no `nuxt.config.ts`.
- **[Dev server]** O template é lido no início do `nuxt dev`. Editar o arquivo pode exigir reiniciar o dev para ver a mudança.

## Migration Plan

Só um arquivo novo. Para desfazer, basta apagar `app/spa-loading-template.html` e as cascas voltam ao `<div id="__nuxt">` vazio. Não há dados nem API envolvidos.
