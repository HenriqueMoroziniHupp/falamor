# Decisões (ADRs)

Registro curto de decisões que alguém (você no futuro, ou outra IA) poderia questionar. Uma decisão por arquivo, numerada. Não se apaga ADR: se mudar de ideia, crie um novo com status "substitui 000X" e marque o antigo como "substituído".

| # | Decisão | Status |
| --- | --- | --- |
| [0001](0001-nuxt-ssr.md) | Nuxt 4 com SSR | aceita |
| [0002](0002-piloto-sem-backend.md) | Piloto sem banco, bucket ou login | aceita |
| [0003](0003-gemini-tts.md) | Voz com Gemini TTS (Interactions API) | aceita |
| [0004](0004-cache-de-voz.md) | Cache de voz em 3 níveis + exemplos pré-gerados | aceita |
| [0005](0005-audiocontext-relogio-mestre.md) | Um AudioContext como relógio da apresentação | aceita |
| [0006](0006-trilha-web-audio.md) | Trilha sintetizada com Web Audio | aceita |
| [0007](0007-protecao-da-previa.md) | Proteção da prévia: marca d'água + barreiras | aceita |
| [0008](0008-fotos-no-navegador.md) | Fotos comprimidas no navegador | aceita |
| [0009](0009-funcionar-sem-contexto-seguro.md) | Funcionar em HTTP na rede local | aceita |
| [0010](0010-expiracao-7-dias.md) | Expiração em 7 dias (lifecycle R2 + tarefa) | proposta |
| [0011](0011-renderizacao-landing-ssr-resto-spa.md) | Só a landing no servidor; o resto no navegador (OG injetado) | aceita |

## Modelo

```md
# 00XX — Título
- **Status:** proposta | aceita | substituída por 00YY
- **Data:** AAAA-MM-DD

## Contexto
Qual problema ou restrição levou à decisão.

## Decisão
O que foi decidido.

## Consequências
O que fica mais fácil, o que fica mais difícil, o que vigiar.
```
