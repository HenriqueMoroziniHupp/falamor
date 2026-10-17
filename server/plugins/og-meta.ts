import type { AppLocale, PublicDeclaration } from '#shared/types/declaration'
import en from '../../i18n/locales/en.json'
import ptBR from '../../i18n/locales/pt-BR.json'

/**
 * A página /d/[id] é montada no navegador (ADR 0011), mas o robô do WhatsApp não executa JS.
 * Aqui só injetamos as tags OG e o status HTTP no HTML de casca, sem renderizar Vue:
 * custa poucos milissegundos de CPU.
 */
const DECLARATION_PATH = /^\/(?:en\/)?d\/([^/]+)\/?$/
const MESSAGES: Record<AppLocale, typeof ptBR> = { 'pt-BR': ptBR, en }

/**
 * O Nuxt 4.6 entrega ao hook um evento no formato web (`url`, `res.status`), mas os tipos
 * do Nitro ainda descrevem o H3Event antigo. Aceitamos os dois formatos.
 */
interface RenderEvent {
  url?: URL
  path?: string
  res?: { status?: number; statusCode?: number }
}

function pathnameOf(event: RenderEvent): string {
  return event.url?.pathname ?? new URL(event.path ?? '/', 'http://localhost').pathname
}

function setStatus(event: RenderEvent, code: number): void {
  if (!event.res) return
  if ('statusCode' in event.res) event.res.statusCode = code
  else event.res.status = code
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ''))
}

function metaTags(meta: Record<string, string | number | undefined>): string {
  return Object.entries(meta)
    .filter(([, content]) => content !== undefined)
    .map(([key, content]) => {
      const attr = key.startsWith('og:') ? 'property' : 'name'
      return `<meta ${attr}="${key}" content="${escapeHtml(String(content))}">`
    })
    .join('')
}

function ogFor(declaration: PublicDeclaration | null, expired: boolean, routeLocale: AppLocale, ttlDays: number) {
  const t = MESSAGES[declaration?.locale ?? routeLocale]
  if (declaration && !expired) {
    return {
      title: fill(t.og.title, { name: declaration.partnerName }),
      description: fill(t.og.description, { name: declaration.authorName }),
      coverUrl: declaration.coverUrl,
    }
  }
  if (expired) return { title: t.expired.title, description: fill(t.expired.text, { days: ttlDays }), coverUrl: undefined }
  return { title: t.error.notFoundTitle, description: t.error.notFoundText, coverUrl: undefined }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', async (html, context) => {
    const event = context.event as unknown as RenderEvent
    const pathname = pathnameOf(event)
    const match = DECLARATION_PATH.exec(pathname)
    if (!match) return

    const config = useRuntimeConfig()
    const ttlDays = Number(config.public.declarationTtlDays)
    const declaration = await useDeclarationRepository().findById(decodeURIComponent(match[1]!))
    const expired = Boolean(declaration && Date.parse(declaration.expiresAt) <= Date.now())

    // Status certo para robôs e prévias (o app no navegador mostra a tela correspondente).
    if (!declaration) setStatus(event, 404)
    else if (expired) setStatus(event, 410)

    const routeLocale: AppLocale = pathname.startsWith('/en/') ? 'en' : 'pt-BR'
    const og = ogFor(declaration, expired, routeLocale, ttlDays)
    const absolute = (path: string) => new URL(path, config.public.siteUrl).toString()

    const tags = metaTags({
      'description': og.description,
      'robots': 'noindex, nofollow',
      'og:title': og.title,
      'og:description': og.description,
      'og:type': 'website',
      'og:site_name': 'Falamor',
      'og:url': absolute(pathname),
      'og:image': og.coverUrl ? absolute(og.coverUrl) : undefined,
      'og:image:width': og.coverUrl ? 1200 : undefined,
      'og:image:height': og.coverUrl ? 630 : undefined,
      'og:image:type': og.coverUrl ? 'image/jpeg' : undefined,
      'og:image:alt': og.coverUrl ? og.title : undefined,
      'twitter:card': og.coverUrl ? 'summary_large_image' : 'summary',
    })

    // Troca o <title> padrão do app pelo da declaração e acrescenta as metas.
    html.head = html.head.map((chunk) => chunk.replace(/<title>[^<]*<\/title>/, ''))
    html.head.push(`<title>${escapeHtml(og.title)}</title>${tags}`)
  })
})
