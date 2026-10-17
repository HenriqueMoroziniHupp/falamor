# 0004 — Cache de voz em 3 níveis + exemplos pré-gerados
- **Status:** aceita
- **Data:** 2026-10-16

## Contexto
Cada geração de voz custa crédito. O briefing pede que o áudio só seja regerado se o texto mudar, e que os exemplos não gastem nada.

## Decisão
Ordem de busca (`useDeclarationAudio`):
1. **Exemplo exato** (idioma + voz) → MP3 estático em `public/audio/samples`.
2. **IndexedDB** do navegador.
3. **Servidor** (`useStorage('tts')`), com a chave `sha256(modelo, voz, estilo, idioma, texto normalizado)`.
4. Só então o Gemini.

Pedidos idênticos simultâneos compartilham a mesma geração. O rate limit por IP conta só as gerações reais.

Os exemplos **não têm nomes** e têm variante por gênero de quem fala ("Obrigado/Obrigada"). Ao trocar a voz, o texto troca junto.

## Consequências
- Exemplos custam zero. Editar um texto de exemplo exige rodar `npm run samples:generate`.
- Mudar o estilo, a voz ou o modelo invalida o cache do servidor (gera de novo sob demanda).
- O rate limit está em memória: precisa ir para KV/D1 antes de rodar vários workers.
