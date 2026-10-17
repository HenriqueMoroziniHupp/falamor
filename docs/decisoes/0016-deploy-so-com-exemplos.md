# 0016 — Deploy de demonstração só com declarações de exemplo
- **Status:** aceita
- **Data:** 2026-10-17

## Contexto
- O primeiro deploy público serve para outras pessoas simularem o produto (assistente e prévia).
- A publicação por link ainda não existe (fase pós-piloto). Abrir a geração de voz para qualquer visitante custaria crédito do Gemini sem retorno, e o limite por IP fica em memória.
- Os exemplos já têm áudio pré-gerado em `public/audio/samples` (ADR 0004).

## Decisão
- Flag `runtimeConfig.public.customText`, **desligada por padrão**. Para ligar: `NUXT_PUBLIC_CUSTOM_TEXT=true`.
- Desligada:
  - o assistente esconde "Escrever a minha" e "Editar este texto", com um subtítulo próprio (`declaration.subtitleSamples`);
  - um rascunho antigo em modo próprio volta para o exemplo escolhido;
  - `useDeclarationAudio` só usa o MP3 do exemplo e nunca chama `/api/tts`;
  - `/api/tts` responde 403 (`custom_text_disabled`), para ninguém gastar crédito chamando a API direto.

## Consequências
- O deploy não precisa de `NUXT_GEMINI_API_KEY` nem de disco persistente para `.data/tts`.
- Para desenvolver ou testar o texto próprio localmente, é preciso `NUXT_PUBLIC_CUSTOM_TEXT=true` no `.env`.
- Exemplo novo ou editado exige `npm run samples:generate` antes do deploy. Sem o MP3, a prévia oferece ver sem voz.
