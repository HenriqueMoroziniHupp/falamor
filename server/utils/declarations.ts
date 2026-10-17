import type { H3Event } from 'h3'
import { APP_CONFIG } from '#shared/config'
import { createMockDeclarationRepository, type DeclarationRepository } from '../repositories/declarations'

let repository: DeclarationRepository | null = null

/** Ponto único para trocar o mock pelo repositório real (D1/Postgres + R2). */
export function useDeclarationRepository(event?: H3Event): DeclarationRepository {
  if (!repository) {
    repository = createMockDeclarationRepository({ ttlDays: APP_CONFIG.declaration.ttlDays })
  }
  return repository
}
