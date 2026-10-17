# 0010 — Expiração em 7 dias (lifecycle R2 + tarefa)
- **Status:** proposta (implementar na Fase 1)
- **Data:** 2026-10-16

## Contexto
As declarações ficam no ar 7 dias (configurável em `APP_CONFIG.declaration.ttlDays`, em `shared/config.ts`) para não acumular custo no banco e no bucket. O LGPD também pede não guardar fotos de pessoas além do necessário.

## Decisão
- **Regra de lifecycle no R2**, que apaga objetos com mais de N dias, como mecanismo principal: não depende do nosso código rodar.
- **Tarefa agendada do Nitro**, que marca as declarações vencidas no banco e apaga o que sobrar no R2, como garantia.
- A página `/d/[id]` responde **410** com a tela "Essa declaração já cumpriu sua missão" (já implementado com mock).

## Consequências
- Se o TTL ficar configurável por declaração (upsell "mais tempo"), a regra de lifecycle por idade não basta: usar prefixos por duração ou apagar pela tarefa.
