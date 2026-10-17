# 0009 — Funcionar em HTTP na rede local
- **Status:** aceita
- **Data:** 2026-10-16

## Contexto
No teste pelo celular via `http://192.168.x.x`, o navegador trata a página como insegura e desliga `crypto.randomUUID` e `crypto.subtle`. Com isso, o envio de fotos e a prévia com texto próprio quebravam (Android 8, em 2026-10-16).

## Decisão
- `shared/utils/text.ts` tem `randomId()` (usa `getRandomValues`, que funciona em HTTP).
- Também tem `sha256Hex()`, que usa o WebCrypto quando existe e cai para um SHA-256 em JS puro quando não existe. Um teste garante que os dois dão o mesmo resultado.

## Consequências
- Testar no celular pela rede local funciona.
- Regra: não usar APIs que exigem contexto seguro sem uma alternativa (ou usar túnel HTTPS para testar).
