# 0003 — Voz com Gemini TTS (Interactions API)
- **Status:** aceita
- **Data:** 2026-10-16

## Contexto
O briefing pede `gemini-3.8-flash-lite-tts` com a chave do Google AI Studio. Esse modelo usa a **Interactions API** do `@google/genai`; o texto é lido literalmente.

## Decisão
- A instrução de estilo ("voz romântica e apaixonada, em forma de declaração…") vai em `speech_metadata.style`, nunca no texto, para não ser lida em voz alta.
- O idioma vai em `speech_config.language`. Pausas entre parágrafos usam `<short pause>`.
- O áudio é pedido em MP3 **sem** `bit_rate`: o modelo responde `400 Audio bit_rate is not supported`, como vimos em 2026-10-16. Se vier WAV/PCM, converte com lamejs.
- Vozes por env: `NUXT_TTS_VOICE_FEMALE` (Sulafat) e `NUXT_TTS_VOICE_MALE` (Algieba). A interface só mostra "feminina/masculina".
- Tudo atrás do contrato `TtsProvider` (`server/services/tts/`).

## Consequências
- Trocar de provedor ou de modelo é mudar uma implementação, não o endpoint.
- Mudanças na API do Google podem quebrar a geração: testar com o script `samples:generate` depois de atualizar o SDK.
