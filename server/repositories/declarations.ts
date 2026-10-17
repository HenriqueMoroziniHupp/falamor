import type { PublicDeclaration } from '#shared/types/declaration'
import { sampleAudioPath, sampleText } from '#shared/samples'
import { DEMO_AUDIO_PATH, DEMO_PARTNER_NAME, demoText } from '#shared/demo'

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

/** Declarações fixas para testar a página pública e o OG sem banco. */
export function createMockDeclarationRepository({ ttlDays }: { ttlDays: number }): DeclarationRepository {
  const build = (): PublicDeclaration[] => [
    withDates(
      {
        id: 'demo',
        locale: 'pt-BR' as const,
        authorName: 'Rafael',
        partnerName: DEMO_PARTNER_NAME,
        startDate: '2022-02-14',
        voice: 'male' as const,
        music: 'piano_warm' as const,
        // Única com o nome falado no áudio (ver shared/demo.ts).
        text: demoText(),
        photoUrls: DEMO_PHOTOS,
        coverUrl: '/demo/cover.jpg',
        audioUrl: DEMO_AUDIO_PATH,
      },
      1,
      ttlDays,
    ),
    withDates(
      {
        id: 'demo-en',
        locale: 'en' as const,
        authorName: 'Olivia',
        partnerName: 'Noah',
        startDate: '2021-06-05',
        voice: 'female' as const,
        music: 'starlight_box' as const,
        text: sampleText('primavera', 'en', 'female'),
        photoUrls: [...DEMO_PHOTOS].reverse(),
        coverUrl: '/demo/cover.jpg',
        audioUrl: sampleAudioPath('primavera', 'en', 'female'),
      },
      1,
      ttlDays,
    ),
    withDates(
      {
        id: 'demo-expirada',
        locale: 'pt-BR' as const,
        authorName: 'Rafael',
        partnerName: DEMO_PARTNER_NAME,
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
