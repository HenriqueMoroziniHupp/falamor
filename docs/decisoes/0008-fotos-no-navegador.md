# 0008 — Fotos comprimidas no navegador
- **Status:** aceita
- **Data:** 2026-10-16

## Contexto
Fotos de celular têm de 5 a 10 MB. Ocupam espaço no IndexedDB (piloto) e no R2 (depois), e pesam no 4G de quem recebe.

## Decisão
- Antes de salvar, o navegador redimensiona para no máximo 1600 px e grava JPEG 0,85, corrigindo a rotação do EXIF.
- Limite de 10 fotos; a primeira é a capa (e a base do og:image).
- As fotos da demo são do Unsplash (licença livre), com 1280 px; créditos em `public/demo/CREDITS.md`.

## Consequências
- Cada foto fica com uns 150–600 KB, e o upload da Fase 1 fica leve.
- HEIC não abre no Chrome do computador (o iPhone já converte sozinho). Reavaliar se aparecer reclamação.
