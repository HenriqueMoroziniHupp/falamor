# Experimentos

Uma hipótese por vez, com critério de sucesso definido **antes** de rodar. Resultado ruim também é registrado.

## Modelo

```md
### EXP-XX — Título curto
- **Status:** planejado | rodando | concluído | cancelado
- **Hipótese:** Se <mudança>, então <métrica> vai <subir/cair> porque <motivo>.
- **Como:** o que será feito, com quantas pessoas, por quanto tempo.
- **Sucesso se:** número claro (ex.: conversão ≥ 8%).
- **Resultado:** números + o que observamos.
- **Decisão:** o que muda no produto (e link para o ADR, se virar decisão).
```

## Registro

### EXP-01 — A experiência emociona?
- **Status:** planejado (Fase 0)
- **Hipótese:** Quem cria uma declaração no Falamor e mostra para o par tem uma reação emocional forte e diria que pagaria por isso.
- **Como:**
  - 10 pessoas em relacionamento criam uma declaração com fotos reais, no próprio celular.
  - Observar sem ajudar.
  - Depois, perguntar: "Mandaria isso? Quanto pagaria? O que faltou?"
- **Sucesso se:**
  - ≥ 7 de 10 terminam sozinhas em menos de 10 minutos;
  - ≥ 6 dizem que mandariam;
  - a maioria cita um preço ≥ R$ 5.
- **Resultado:** —
- **Decisão:** —

### EXP-02 — Preço
- **Status:** planejado (Fase 1)
- **Hipótese:** R$ 9,90 por declaração gera mais receita que 3 por R$ 5, sem derrubar a conversão pela metade.
- **Como:** teste A/B na tela de publicar (50/50), por 2 semanas ou 200 prévias, o que vier primeiro.
- **Sucesso se:** receita por prévia da opção B ≥ 1,3× a da opção A.
- **Resultado:** —
- **Decisão:** —

### EXP-03 — Vozes
- **Status:** planejado (Fase 0)
- **Hipótese:** Existe uma voz feminina e uma masculina claramente preferidas para declarações.
- **Como:**
  - `npm run samples:generate -- --audition` gera 4 vozes de cada.
  - 5 pessoas ouvem às cegas e escolhem a mais emocionante.
- **Sucesso se:** uma voz de cada gênero leva ≥ 3 de 5 votos.
- **Resultado:** —
- **Decisão:** atualizar `NUXT_TTS_VOICE_*` e rodar `samples:generate -- --force`.

### EXP-04 — Prévia curta vs. completa
- **Status:** ideia (só rodar se a conversão for baixa)
- **Hipótese:** Mostrar só os primeiros 20 s na prévia aumenta a conversão, porque a pessoa quer ver o resto.
- **Como:** A/B entre prévia completa com marca d'água e prévia de 20 s.
- **Sucesso se:** conversão prévia → pagamento ≥ 1,2× sem aumento de reclamações.
- **Resultado:** —
- **Decisão:** —
