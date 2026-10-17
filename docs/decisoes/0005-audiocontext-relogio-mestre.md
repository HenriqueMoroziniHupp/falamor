# 0005 — Um AudioContext como relógio da apresentação
- **Status:** aceita
- **Data:** 2026-10-16

## Contexto
Fotos, legendas, voz e música precisam andar juntas, inclusive ao pausar.

## Decisão
- Voz (AudioBuffer) e trilha tocam no **mesmo AudioContext**.
- O tempo da apresentação é `ctx.currentTime - startAt`, e pausar é `ctx.suspend()`.
- A linha do tempo (`app/lib/timeline.ts`) é pura e testada:
  - cada foto fica de 3,5 a 8 s na tela, em loop se faltar foto;
  - as legendas ficam na tela por um tempo proporcional ao tamanho da frase.
- Sem voz, a duração é estimada.

## Consequências
- Zero dessincronia. Não usar `<audio>` nem timers paralelos para nada que precise ficar em sincronia.
- O áudio só começa com um toque do usuário (envelope com lacre), por causa da política de autoplay.
