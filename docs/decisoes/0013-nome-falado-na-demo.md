# 0013 — Nome falado no áudio da demonstração
- **Status:** aceita
- **Data:** 2026-10-17

## Contexto
- "Ver um exemplo" (`/d/demo`, `/en/d/demo-en`) é a vitrine da landing: é ali que o visitante decide se o produto emociona.
- Os exemplos do assistente não têm nomes (ADR 0004), para o mesmo MP3 servir a todo mundo. Por isso a demo também soava genérica, sem o nome de quem recebe.

## Decisão
- A demo fala o nome de quem recebe no começo e no fim: "Helena, desde que você… Eu te amo infinitamente, Helena!" e "Noah, if I could hold time… my heart is yours, Noah.".
- Uma demo por idioma, e o botão da landing abre a do idioma atual. Em inglês o nome é Noah: comum nos EUA e no Reino Unido e fácil de pronunciar. Helena fica só em português.
- `DEMOS` em `shared/demo.ts` define cada demo (autor, nome, voz, exemplo). `demoText()` = exemplo + `withPartnerName`. Os exemplos em `shared/samples.ts` continuam sem nomes.
- O áudio fica à parte, em `public/audio/demo/`, gerado pelo mesmo `npm run samples:generate`.
- Helena também na demo expirada e no mockup da landing em português.

## Consequências
- A demo mostra o produto como o cliente vai usar: com o nome dito em voz alta.
- `matchSample()` não reconhece o texto da demo. Não faz diferença, porque a página pública usa o `audioUrl` da declaração.
- Mudar um nome ou o exemplo de uma demo exige `npm run samples:generate -- --force` (ou apagar `public/audio/demo/*.mp3`) e rebuild da landing.
- Um idioma novo precisa de uma entrada em `DEMOS` (o tipo obriga) e de `samples:generate`.
