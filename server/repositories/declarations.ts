import type { PublicDeclaration } from '#shared/types/declaration'
import { sampleText } from '#shared/samples'
import { DEMOS, demoAudioPath, demoText, type Demo } from '#shared/demo'

/**
 * Contrato de persistência das declarações publicadas.
 * Piloto: mock em memória. Pós-piloto: D1/Postgres (metadados) + R2 (fotos/áudio).
 */
export interface DeclarationRepository {
  findById(id: string): Promise<PublicDeclaration | null>
}

const DAY_MS = 24 * 60 * 60 * 1000
/** Fotos de casais do Unsplash (licença livre) — créditos em public/demo/CREDITS.md. */
const DEMO_PHOTOS = ['/demo/1.jpg', '/demo/2.jpg', '/demo/3.jpg', '/demo/4.jpg', '/demo/5.jpg', '/demo/6.jpg']

function withDates<T extends object>(data: T, createdAgoDays: number, ttlDays: number) {
  const createdAt = new Date(Date.now() - createdAgoDays * DAY_MS)
  return {
    ...data,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + ttlDays * DAY_MS).toISOString(),
  }
}

/** Demonstrações do "Ver um exemplo": nome falado no áudio (ver shared/demo.ts). */
function fromDemo(demo: Demo) {
  const { id, locale, authorName, partnerName, voice } = demo
  return { id, locale, authorName, partnerName, voice, text: demoText(demo), audioUrl: demoAudioPath(demo) }
}

/** Declarações fixas para testar a página pública e o OG sem banco. */
export function createMockDeclarationRepository({ ttlDays }: { ttlDays: number }): DeclarationRepository {
  const build = (): PublicDeclaration[] => [
    withDates(
      {
        ...fromDemo(DEMOS['pt-BR']),
        startDate: '2022-02-14',
        music: 'piano_warm' as const,
        photoUrls: DEMO_PHOTOS,
        coverUrl: '/demo/cover.jpg',
      },
      1,
      ttlDays,
    ),
    withDates(
      {
        ...fromDemo(DEMOS.en),
        startDate: '2021-06-05',
        music: 'starlight_box' as const,
        photoUrls: [...DEMO_PHOTOS].reverse(),
        coverUrl: '/demo/cover.jpg',
      },
      1,
      ttlDays,
    ),
    withDates(
      {
        id: 'demo-expirada',
        locale: 'pt-BR' as const,
        authorName: 'Rafael',
        partnerName: DEMOS['pt-BR'].partnerName,
        startDate: null,
        voice: 'male' as const,
        music: 'cinema_strings' as const,
        text: sampleText('jeitinho', 'pt-BR', 'male'),
        photoUrls: DEMO_PHOTOS,
        coverUrl: '/demo/cover.jpg',
        audioUrl: null,
      },
      ttlDays + 1,
      ttlDays,
    ),
  ]

  return {
    async findById(id) {
      // Recalcula as datas a cada leitura para a demo nunca expirar sozinha.
      return build().find((d) => d.id === id) ?? null
    },
  }
}
