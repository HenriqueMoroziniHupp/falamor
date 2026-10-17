import { APP_CONFIG } from '#shared/config'

/**
 * /llms.txt (llmstxt.org): resumo do Falamor para assistentes de IA e buscadores.
 * Pré-renderizado no build (routeRules), então os links absolutos usam NUXT_PUBLIC_SITE_URL do build.
 * Não cite preço nem detalhes técnicos de voz: o preço ainda não foi decidido (docs/produto.md).
 */
export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public
  const url = (path: string) => new URL(path, siteUrl).toString()
  const { maxPhotos } = APP_CONFIG.declaration

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  return `# Falamor

> O Falamor transforma as fotos de um casal numa declaração de amor falada, com música, no estilo das "Recordações" do Google Fotos, pronta para enviar por link no WhatsApp. Fica pronto em poucos minutos, pelo celular, sem precisar editar nada.

O Falamor é um presente emocional, não um editor de vídeo nem um álbum permanente. A pessoa escolhe até ${maxPhotos} fotos, escreve a declaração com as próprias palavras ou escolhe um dos textos prontos, e escolhe uma voz (feminina ou masculina) e um estilo de música. O resultado é uma apresentação com as fotos passando, a declaração lida em voz alta com emoção, legendas, trilha sonora e um contador do tempo que o casal está junto. Quem recebe abre o link no celular, toca no envelope e assiste.

Criar e ver a prévia é grátis. Está disponível em português (Brasil) e em inglês.

## Páginas

- [Página inicial](${url('/')}): o que é o Falamor e como funciona.
- [Criar uma declaração](${url('/criar')}): assistente em 4 passos (nomes, fotos, declaração e prévia).
- [Exemplo de declaração](${url('/d/demo')}): uma declaração pronta para ver como fica.

## Como funciona

1. Escolha até ${maxPhotos} fotos: das viagens, dos aniversários e das bobeiras do dia a dia.
2. Diga o que sente: com as suas palavras ou com uma das declarações prontas.
3. Envie o link: quem você ama abre no celular, aumenta o som e sente cada palavra.

## Ocasiões

- Dia dos Namorados (12 de junho no Brasil)
- Aniversário de namoro ou casamento
- Natal e Ano Novo
- Pedido de namoro ou casamento, reconciliação, relacionamento à distância

## English

- [Home (English)](${url('/en')}): Falamor turns a couple's photos into a spoken love declaration with music, ready to send as a link on WhatsApp.
- [Example declaration (English)](${url('/en/d/demo-en')}): see what a finished declaration looks like.
`
})
