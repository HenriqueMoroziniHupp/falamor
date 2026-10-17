# 0014 — Abertura imersiva: tela cheia, som de papel e envelope mais lento
- **Status:** aceita
- **Data:** 2026-10-17

## Contexto
- O toque no lacre é o único gesto garantido antes da apresentação. Ele já destrava o áudio (ADR 0005), e é também o que o navegador exige para entrar em tela cheia.
- A abertura do envelope durava 1,5 s, sem som, e a carta saía por trás da aba aberta.
- Com uma abertura mais longa, a apresentação (título de 3,5 s) começaria escondida atrás da capa.

## Decisão
- **Tela cheia** no toque do lacre, nos dois modos (prévia e página pública), pedida antes de qualquer `await` (`app/utils/fullscreen.ts`). Sai da tela cheia ao fechar ou desmontar o player. Onde não há suporte (iPhone só permite em `<video>`), nada acontece.
- **Espera de 500 ms** (`FULLSCREEN_SETTLE_MS`) entre o toque e a animação, só onde há tela cheia: no celular a troca de modo trava um instante e comeria o começo da abertura.
- **Som de papel gravado**, não sintetizado: a primeira versão em ruído filtrado soou artificial. É o "Paper slide" do Mixkit (`public/audio/sfx/paper-slide.mp3`, ~37 KB, 1,1 s), com licença gratuita para uso comercial e sem atribuição. É baixado e decodificado na montagem do player (`usePlayback.preloadSound`), sem bloquear a preparação, e toca no mesmo AudioContext (`playSound`), junto com a carta subindo (`PAPER_SOUND_AT`). Respeita o mudo e não sofre o ducking da trilha.
- **Abertura de 5,8 s** (`COVER_OPEN_MS` em `app/lib/player.ts`): lacre → aba → carta saindo à frente da aba → carta parada com o nome por cerca de 1 s → capa some. O nome é o primeiro momento emocional da declaração, então tem tempo para ser lido. A trilha começa no toque. Voz, fotos e legendas começam depois da espera e da abertura (`usePlayback.start(delay)`).

## Consequências
- Mudar as transições de `PlayerCover.vue` exige ajustar `COVER_OPEN_MS` e `PAPER_SOUND_AT`.
- O aviso do navegador ao entrar em tela cheia ("Para sair da tela cheia, arraste…" no Android) é interface de segurança do navegador e não pode ser escondido pela página. Só some num PWA instalado com `display: fullscreen`.
- A prévia estrita vela a tela no `blur`. Se algum navegador disparar `blur` ao entrar em tela cheia, a prévia abre pausada: vigiar.
- No iPhone a experiência continua sem tela cheia. A alternativa seria um `<video>`, que conflita com o relógio único do AudioContext.
