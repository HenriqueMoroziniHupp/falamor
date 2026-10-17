# Roadmap — Falamor

Meta: **R$ 5 mil/mês** de lucro, começando pelo Brasil e depois indo para fora.
Atualizado em 17/10/2026.

## Visão geral

| Fase | Período | Objetivo | Marco de saída |
| --- | --- | --- | --- |
| 0. Piloto | out/2026 | Validar a experiência (fotos + voz + trilha) | 10 casais testaram e se emocionaram |
| 1. MVP pago | nov–dez/2026 | Alguém de fora pagar e publicar | 1ª venda de um desconhecido |
| 2. Lançamento | jan–fev/2027 | Tração no Brasil + Valentine's lá fora | 300 declarações vendidas em fevereiro |
| 3. Crescimento | mar–jun/2027 | Dia das Mães e **Dia dos Namorados** | Mês de junho ≥ R$ 5 mil |
| 4. Internacional | 2º sem/2027 | Espanhol, moedas locais, receita fora da sazonalidade | Receita recorrente ≥ R$ 5 mil todo mês |

**Datas que vendem** (o produto é sazonal; cada fase mira uma delas):
- Natal: 25/12/2026
- Valentine's Day: 14/02/2027 (EN)
- Dia das Mães: 09/05/2027
- **Dia dos Namorados: 12/06/2027**, o pico do ano no Brasil

---

## Fase 0 — Piloto (agora)

Já está pronto:
- Wizard em 4 passos.
- Envio de fotos com compressão e ordenação.
- Voz Gemini com cache em 3 níveis e 12 áudios de exemplo pré-gerados.
- Trilha em Web Audio com 4 estilos.
- Player estilo Recordações, com envelope, contador e proteção da prévia.
- Página pública com OG (mock).
- PT/EN.
- Testes.

O que falta:
- [ ] Ouvir e escolher as vozes (`npm run samples:generate -- --audition`) e ajustar o estilo da fala.
- [ ] Ajustar o volume e o clima de cada trilha, ouvindo no celular.
- [ ] Testar em aparelhos reais: Android antigo, iPhone (modo silencioso) e Samsung Internet.
- [ ] Testar com **10 casais de verdade**:
  - observar onde travam;
  - medir quanto tempo levam para criar;
  - perguntar se pagariam e quanto.
- [ ] Baixar os MP3 de exemplo para 64 kbps (hoje ~650 KB cada; ficariam com metade).
- [ ] Deixar o fundo desfocado do player mais leve em celular fraco.
- [ ] HTTPS no teste pelo celular (túnel cloudflared), para testar igual à produção.

## Fase 1 — MVP pago (nov–dez/2026)

O mínimo para alguém pagar, publicar e mandar o link.

**Conta e dados**
- [ ] Login com Google (`nuxt-auth-utils`).
- [ ] Banco: D1 (se for tudo Cloudflare) ou Postgres (Neon) + Drizzle. Tabelas: `users`, `declarations`, `credits_ledger`, `payments`.
- [ ] Implementar o `DeclarationRepository` real em `server/utils/declarations.ts`.

**Publicação**
- [ ] Endpoint de publicar:
  - envio das fotos já comprimidas, do áudio e da capa 1200×630 para o **R2**;
  - geração do id curto e do link `/d/{id}` (com `/en` quando for inglês).
- [ ] Copiar o link + botão "Enviar no WhatsApp".
- [ ] Expiração em 7 dias: regra de lifecycle no R2 + tarefa agendada do Nitro apagando registros vencidos.
- [ ] Trocar o `useStorage('tts')` para o R2.

**Pagamento**
- [x] Decidir o provedor: **Mercado Pago (Pix)** no Brasil e **Creem** (Merchant of Record, em dólar) no exterior ([ADR 0015](docs/decisoes/0015-pagamento-mercado-pago-e-creem.md)).
- [ ] Confirmar com a Creem (pessoa física do Brasil? saque por ACH para a conta global do Inter?) e com o Inter (conta pessoa física pode receber de plataforma de vendas?).
- [ ] Interface `PaymentProvider` com as implementações Mercado Pago e Creem, escolhida pelo idioma.
- [ ] Créditos: pacote pago → crédito → publicar consome 1 crédito (registro em `credits_ledger`).
- [ ] Webhook de confirmação de pagamento, idempotente.

**Produção**
- [ ] Deploy na Cloudflare (Workers + R2), domínio próprio, HTTPS.
- [ ] Rate limit em KV/D1 (o atual é em memória) e limite de gerações de voz por usuário.
- [ ] Monitoramento de erros (Sentry) e analytics de funil (PostHog): criou → prévia → pagou → publicou → link aberto.
- [ ] Termos de uso e política de privacidade (LGPD: são fotos de pessoas).
- [ ] Botão "denunciar" na página pública + direito de remover conteúdo.

**Marco:** 1ª venda de um desconhecido.

## Fase 2 — Lançamento (jan–fev/2027)

- [ ] Landing com prova social (exemplos reais autorizados) e SEO para "declaração de amor", "surpresa para namorada", etc.
- [ ] Conteúdo no Instagram/TikTok: o próprio produto vira vídeo (gravar reações de quem recebe, com autorização).
- [ ] Loop viral: o "Crie a sua" no final da página pública + cupom para quem recebeu.
- [ ] Campanha de **Valentine's Day** em inglês (landing `/en` + anúncios de teste).
- [ ] Mais 3–5 declarações de exemplo por idioma (aniversário de namoro, pedido de namoro, distância).

**Marco:** 300 declarações vendidas em fevereiro.

## Fase 3 — Crescimento (mar–jun/2027)

Aumentar o ticket e pegar as duas maiores datas.

- [ ] **Dia das Mães:** nova "ocasião" além de casal (textos, trilhas e capa para mãe; sem contador de namoro).
- [ ] **Dia dos Namorados:** campanha forte a partir de maio.
- [ ] Upsells (testar um de cada vez):
  - [ ] Ficar no ar mais tempo (30 dias / 1 ano).
  - [ ] Entrega agendada: o link "abre" só na data escolhida.
  - [ ] Cartão com QR Code para imprimir junto com um presente.
  - [ ] Exportar vídeo (MP4) — produto premium; contraria a proteção da prévia, então só depois de pago.
  - [ ] **A declaração na sua voz**: o Gemini permite criar vozes personalizadas; exige consentimento explícito da pessoa.
- [ ] Mais trilhas e efeitos de transição.

**Marco:** junho/2027 ≥ R$ 5 mil.

## Fase 4 — Internacional (2º semestre/2027)

- [ ] Espanhol (`es.json`, exemplos em `shared/samples.ts`, estilo de voz, `samples:generate`).
- [ ] Preço por moeda (a Creem já cobra em dólar; avaliar outras moedas).
- [ ] Datas locais: San Valentín, Día de la Madre (varia por país), aniversários.
- [ ] Ocasiões o ano inteiro (aniversário de namoro, casamento, pedido) para depender menos de sazonalidade.

---

## Decisões em aberto

| Decisão | Opções | Quando decidir |
| --- | --- | --- |
| Preço | R$ 5 por 3 (prompt original) × R$ 9,90 por 1 × R$ 19,90 por 3 | Depois dos testes da Fase 0 |
| Banco | D1 × Postgres (Neon) | Início da Fase 1 |
| Duração padrão | 7 dias × mais tempo como upsell | Fase 1 |
| Domínio e marca | falamor.com.br / .app | Fase 1 |

**Conta de referência para a meta:**
- R$ 5 mil líquidos/mês ≈ **~520 vendas de R$ 9,90** ou **~3.000 declarações** no modelo de 3 por R$ 5.
- Antes de fixar o preço, medir o custo real de voz por declaração (cerca de 40 s de áudio) e as taxas do pagamento.

## Métricas para acompanhar

- **Conversão prévia → pagamento** (a principal).
- Custo de voz por declaração publicada (e % das prévias que usam exemplo sem custo).
- Links abertos ÷ links publicados (a pessoa realmente recebeu?).
- Quem recebeu e criou a sua (viralidade).
- Custo de aquisição por venda nos anúncios.

## Riscos

| Risco | Mitigação |
| --- | --- |
| Gravarem a prévia em vez de pagar | Marca d'água; prévia curta como teste A/B se a conversão for baixa |
| Custo ou mudança da API do Gemini (já aconteceu: `bit_rate`) | Cache em 3 níveis, contrato `TtsProvider` para trocar de provedor, testes |
| Conteúdo impróprio em link público | Termos, botão de denúncia, links não indexados, expiração |
| Celulares antigos/lentos | Testes em aparelho real, fotos comprimidas, efeitos leves |
| Sazonalidade | Ocasiões o ano todo (Fases 3 e 4) |
| LGPD | Política clara, exclusão automática, direito de remoção |
