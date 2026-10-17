import type { H3Event } from 'h3'
import { createMockDeclarationRepository, type DeclarationRepository } from '../repositories/declarations'

let repository: DeclarationRepository | null = null

/** Ponto único para trocar o mock pelo repositório real (D1/Postgres + R2). */
export function useDeclarationRepository(event: H3Event): DeclarationRepository {
  if (!repository) {
    const config = useRuntimeConfig(event)
    repository = createMockDeclarationRepository({ ttlDays: Number(config.public.declarationTtlDays) })
  }
  return repository
}
