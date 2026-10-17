# 0007 — Proteção da prévia: marca d'água + barreiras
- **Status:** aceita
- **Data:** 2026-10-16

## Contexto
O briefing pede proteção contra print e gravação, para a pessoa não gravar a prévia em vez de pagar. Nenhum navegador consegue bloquear o gravador de tela do sistema (iOS/Android/OBS) nem uma câmera apontada.

## Decisão
- Prévia com marca d'água animada "prévia" e um selo que muda de lugar.
- Barreiras:
  - bloqueio de Ctrl/Cmd+P e Ctrl/Cmd+S;
  - tela preta no PrintScreen;
  - sem clique direito nem "salvar imagem";
  - pausa com véu ao perder o foco.
- A página publicada fica sem marca d'água.

## Consequências
- A marca d'água é a proteção real; as barreiras só atrapalham o usuário casual.
- Se a conversão for baixa, testar a prévia curta (EXP-04 em `docs/experimentos.md`).
