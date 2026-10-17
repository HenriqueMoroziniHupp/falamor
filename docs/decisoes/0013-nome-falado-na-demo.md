# 0013 — Nome falado no áudio da demonstração
- **Status:** aceita
- **Data:** 2026-10-17

## Contexto
- "Ver um exemplo" (`/d/demo`) é a vitrine da landing: é ali que o visitante decide se o produto emociona.
- Os exemplos do assistente não têm nomes (ADR 0004), para o mesmo MP3 servir a todo mundo. Por isso a demo também soava genérica, sem o nome de quem recebe.

## Decisão
- A demo fala o nome da parceira no começo e no fim: "Helena, desde que você… Eu te amo infinitamente, Helena!".
- O texto vem de `shared/demo.ts` (`demoText()` = exemplo `lugar-favorito` + `withPartnerName`). Os exemplos em `shared/samples.ts` continuam sem nomes.
- O áudio fica à parte, em `public/audio/demo/`, gerado pelo mesmo `npm run samples:generate`.
- Nome "Helena", também na demo expirada e no mockup da landing.

## Consequências
- A demo mostra o produto como o cliente vai usar: com o nome dito em voz alta.
- `matchSample()` não reconhece o texto da demo. Não faz diferença, porque a página pública usa o `audioUrl` da declaração.
- Mudar o nome ou o exemplo `lugar-favorito` exige `npm run samples:generate -- --force` (ou apagar `public/audio/demo/*.mp3`) e rebuild da landing.
- A demo em inglês (`demo-en`) ainda não tem nome falado.
