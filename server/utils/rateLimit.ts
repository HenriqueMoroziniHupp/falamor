import type { H3Event } from 'h3'

const hitsByIp = new Map<string, number[]>()

/**
 * Limite simples em memória (janela deslizante por IP) para proteger os créditos de TTS.
 * Pós-piloto: trocar por contador no KV/D1, já que vários workers não compartilham memória.
 */
export function consumeRateLimit(event: H3Event, { limit, windowMs }: { limit: number; windowMs: number }): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const now = Date.now()
  const recent = (hitsByIp.get(ip) ?? []).filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    const retryAfter = Math.ceil((windowMs - (now - recent[0]!)) / 1000)
    setResponseHeader(event, 'Retry-After', retryAfter)
    throw createError({ statusCode: 429, statusMessage: 'rate_limited' })
  }

  recent.push(now)
  hitsByIp.set(ip, recent)
}
