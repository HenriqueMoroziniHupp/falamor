# 0002 — Piloto sem banco, bucket ou login
- **Status:** aceita
- **Data:** 2026-10-16

## Contexto
Antes de pagar infraestrutura, é preciso validar se a experiência (fotos + voz + trilha) emociona e se alguém pagaria.

## Decisão
- No piloto, rascunho, fotos e áudios ficam no IndexedDB do navegador.
- O servidor só gera voz (com cache em disco local) e serve dados mock para a página pública (`demo`, `demo-en`, `demo-expirada`).
- Publicar aparece como "em breve".

## Consequências
- Custo zero de infraestrutura e testes rápidos.
- A página pública e o OG não usam dados reais ainda.
- Pontos de troca já prontos para a Fase 1: `DeclarationRepository` (`server/utils/declarations.ts`), driver de `useStorage('tts')` e o contrato `TtsProvider`.
