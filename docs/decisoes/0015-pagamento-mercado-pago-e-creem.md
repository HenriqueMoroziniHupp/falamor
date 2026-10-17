# 0015 — Pagamento: Mercado Pago no Brasil, Creem no exterior
- **Status:** aceita
- **Data:** 2026-10-17

## Contexto
- O público brasileiro paga por impulso, e paga com Pix. Lá fora (Valentine's, em inglês) é cartão em dólar.
- O ticket é baixo (R$ 9,90 aqui, cerca de US$ 4,99 lá fora). Nesse valor, a taxa fixa por transação pesa mais que a porcentagem.
- Quem vende serviço digital de fora para a União Europeia ou o Reino Unido deve o imposto local (VAT) desde a primeira venda. Vender direto (Stripe ou PayPal) deixa essa obrigação conosco.
- O vendedor está no Brasil, ainda como pessoa física. O provedor precisa pagar no Brasil.

Opções avaliadas para o exterior (taxas públicas em out/2026; quanto sobra de uma venda de US$ 4,99):

| Provedor | Taxa | Sobra | Paga no Brasil? | Paga o imposto lá fora? |
| --- | --- | --- | --- | --- |
| Creem | 3,9% + US$ 0,40 | ~US$ 4,40 | sim (1% do saque, mín. US$ 7) | sim (MoR) |
| Paddle | 5% + US$ 0,50 (abaixo de US$ 10: preço sob consulta) | ~US$ 4,24 | provável, não confirmado | sim (MoR) |
| PayPal | 6,4% + US$ 0,30, mais 3,5% ao converter para real | ~US$ 4,22 | sim, só em real | não |
| Stripe direta | 3,99% + R$ 0,39, mais 2% em cartão estrangeiro | a mais alta | sim (aceita CPF) | não |
| Lemon Squeezy | 5% + US$ 0,50, mais 1,5% em cartão estrangeiro | ~US$ 4,10 ou menos | Brasil fora da lista de bancos | sim (MoR) |
| Polar | 5% + US$ 0,50 | — | Brasil fora da lista de saque | sim (MoR) |

Para o Brasil, o Pix da Paddle cobra a mesma taxa fixa (US$ 0,50 ≈ R$ 2,75, quase 30% de R$ 9,90). O Pix da Stripe Brasil só funciona por convite.

## Decisão
- **Brasil (pt-BR, em real): Mercado Pago, com Pix.** Aceita conta com CPF, e o Pix tem taxa baixa e sem parte fixa.
- **Exterior (`/en`, em dólar): Creem**, como Merchant of Record. Tem a menor taxa entre os que pagam no Brasil, paga o imposto do comprador e cuida das contestações de pagamento. Como só a Creem nos paga, o lado brasileiro conta como exportação de serviço para um único cliente.
- **Reserva: Paddle**, se a Creem recusar a conta ou parar de pagar no Brasil. Antes, pedir o preço especial para produtos abaixo de US$ 10.
- **PayPal não é provedor próprio.** É caro, não paga o imposto lá fora e costuma reter o dinheiro de conta nova num pico de vendas.
- **No código:** interface `PaymentProvider` (no mesmo esquema do `TtsProvider`) com duas implementações. Os dois webhooks são idempotentes e gravam no mesmo `credits_ledger`. O provedor é escolhido pelo idioma da página.

## Consequências
- Lá fora, o preço deve ficar em US$ 4,99 por declaração ou em pacotes. Com os US$ 0,40 fixos, US$ 1,99 perderia cerca de 24%.
- São duas integrações, dois painéis e dois saques para conciliar.
- Confirmar antes de integrar:
  - com a Creem: se aceita vendedor pessoa física do Brasil e se paga por ACH para uma conta em dólar nos EUA (a conta global do Inter);
  - com o Inter: se a conta global de pessoa física pode receber pagamentos recorrentes de uma plataforma de vendas (a versão empresarial pede CNPJ);
  - no painel do Mercado Pago: a taxa atual do Pix.
- Impostos no Brasil: como pessoa física, o que vem de fora entra no carnê-leão do mês em que chega (até 27,5%), mesmo que fique em dólar. A conta no exterior vai para a declaração anual. Com CNPJ no Simples, a exportação de serviço não paga ISS, PIS nem COFINS. Abrir o CNPJ quando a receita passar de R$ 2–3 mil por mês, com orientação de contador.
- A Creem é uma empresa nova. Vigiar a estabilidade dela e manter a troca para a Paddle simples (é só uma implementação a mais de `PaymentProvider`).
