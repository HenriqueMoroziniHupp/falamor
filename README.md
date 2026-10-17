# Falamor — piloto

Gerador de declarações de amor no estilo "Recordações" do Google Fotos: fotos passando com zoom lento, declaração recitada por IA (Gemini TTS), trilha romântica gerada ao vivo (Web Audio) e contador de tempo juntos.

O piloto roda **local**: sem banco, sem bucket, sem login, sem pagamento. O rascunho, as fotos e os áudios gerados ficam no IndexedDB do navegador. A chave do Gemini fica só no servidor do Nuxt (Nitro).

Prompt original: [falamor-init-prompt.md](falamor-init-prompt.md) · Próximos passos: [ROADMAP.md](ROADMAP.md) · Produto, marca, decisões e experimentos: [docs/](docs/README.md).

## Rodando

```bash
npm install            # usa .npmrc com legacy-peer-deps (conflito opcional esbuild/vite 8)
cp .env.example .env   # e preencha NUXT_GEMINI_API_KEY
npm run samples:generate   # gera os 12 áudios das declarações de exemplo (uma vez só)
npm run dev                # http://localhost:3000
```

Sem a chave o app funciona, mas a prévia de textos próprios toca só trilha e legendas, com a opção "Ver a prévia sem a voz".

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm run preview` | Build de produção e preview |
| `npm test` | Testes unitários (Vitest) |
| `npm run typecheck` | Checagem de tipos (vue-tsc) |
| `npm run samples:generate` | Gera os áudios de exemplo que faltam (`-- --force` regera tudo) |
| `npm run samples:generate -- --audition` | Gera a mesma frase em 4 vozes femininas e 4 masculinas em `.data/auditions/` para você escolher pelo ouvido |

## Rotas para testar

- `/` — landing (PT) · `/en` — landing (EN)
- `/criar` — wizard: nomes → fotos → declaração → prévia
- `/d/demo` e `/en/d/demo-en` — página pública com OG (dados mock)
- `/d/demo-expirada` — declaração expirada (HTTP 410)

**OG no WhatsApp:** exponha o servidor com `npx cloudflared tunnel --url localhost:3000`, coloque a URL do túnel em `NUXT_PUBLIC_SITE_URL`, reinicie e cole o link `/d/demo` numa conversa.

## Como funciona

**Voz (Gemini TTS, Interactions API).** `POST /api/tts` recebe `{ text, voice, locale }`. O estilo ("voz romântica e apaixonada, em forma de declaração…") vai em `speech_metadata.style`, então não é lido em voz alta. O áudio é pedido em MP3; se vier WAV/PCM, é convertido com lamejs.

O crédito só é gasto quando necessário, nesta ordem:
1. O texto é exatamente um exemplo (no idioma e na voz escolhidos) → asset estático em `public/audio/samples`.
2. Já foi gerado neste navegador → IndexedDB.
3. Já foi gerado no servidor → `useStorage('tts')` (`.data/tts` no piloto). A resposta traz `X-TTS-Cache: HIT`.
4. Só então chama o Gemini (`MISS`). Pedidos idênticos simultâneos esperam a mesma geração, e há rate limit por IP.

A chave de cache inclui modelo, voz, estilo, idioma e texto normalizado. Mudou o texto, gera de novo; espaços extras não contam.

**Exemplos com gênero.** Em português, as declarações de exemplo trocam "Obrigado/Obrigada" conforme a voz escolhida (quem fala). Elas não têm nomes, para que o áudio possa ser pré-gerado.

**Trilha.** `app/lib/audio/RomanticAudioEngine.ts` completa o motor do prompt, mantendo as 4 progressões:
- agendamento antecipado;
- timbre por estilo (Piano, Cinema, Caixinha de música, Serenata);
- reverb e eco;
- crossfade ao trocar de estilo;
- *ducking* (a trilha abaixa enquanto a voz fala).

A voz toca no mesmo `AudioContext`, então pausar congela fotos, legendas, voz e música juntas.

**Apresentação.** `app/lib/timeline.ts` calcula quanto tempo cada foto fica na tela (3,5–8 s, em loop se faltar foto) e quando cada legenda aparece, proporcional ao tamanho da frase. O envelope com lacre é a abertura (o toque também libera o áudio, por causa da política de autoplay).

**Proteção da prévia.** Marca d'água animada "prévia" e um selo que muda de lugar. Também bloqueia Ctrl/Cmd+P e Ctrl/Cmd+S, deixa a tela preta no PrintScreen, impede clique direito e "salvar imagem", e pausa com véu quando a aba perde o foco. **Limite:** nenhum site consegue bloquear o gravador de tela do sistema (iOS/Android/OBS) nem uma câmera apontada para a tela; por isso a marca d'água é a proteção principal. A página publicada não tem marca d'água.

## Renderização

Só a landing (`/` e `/en`) é gerada no servidor: ela é pré-renderizada no build, por SEO. Todo o resto é montado no navegador. A página pública `/d/[id]` também, mas o servidor injeta nela as tags OG (preview do WhatsApp) e o status 404/410 por meio de `server/plugins/og-meta.ts`. Detalhes em [docs/decisoes/0011](docs/decisoes/0011-renderizacao-landing-ssr-resto-spa.md).

## Estrutura

```
app/
  components/wizard/      passos do wizard (StepNames, StepPhotos, StepDeclaration, StepPreview…)
  components/player/      DeclarationPlayer + capa (envelope), slides, legendas, encerramento, marca d'água
  components/declaration/ exemplos, editor, voz, trilha
  composables/            useDraft (IndexedDB), useDeclarationAudio, usePlayback, useCaptureGuard, useTogetherCounter
  lib/                    timeline (puro), audio/RomanticAudioEngine
  pages/                  index, criar, d/[id]
server/
  api/tts.post.ts                 geração + cache de voz
  api/declarations/[id].get.ts    declaração publicada (404 / 410)
  services/tts/                   TtsProvider (contrato), gemini, estilo da voz, wav→mp3
  repositories/declarations.ts    DeclarationRepository + mock
shared/                   tipos, declarações de exemplo, utilitários (usados no app, no servidor e no script)
i18n/locales/             pt-BR.json, en.json
scripts/                  generate-sample-audios.ts
tests/unit/               timeline, contador, exemplos/cache key, wav→mp3
```

## Para sair do piloto

Os pontos de troca já existem:

- **Banco:** implementar `DeclarationRepository` (D1 ou Postgres + Drizzle) e trocar em `server/utils/declarations.ts`.
- **R2:** trocar o driver de `nitro.storage.tts` (e criar `media`) para o driver S3/R2 do unstorage. Para apagar em 7 dias: **regra de lifecycle do R2** + scheduled task do Nitro como garantia, com `NUXT_PUBLIC_DECLARATION_TTL_DAYS`.
- **Publicar:** endpoint que recebe fotos (já comprimidas no navegador), áudio e capa 1200×630, salva no R2 e devolve `/d/{id}` (com prefixo de idioma para EN).
- **Login:** `nuxt-auth-utils` com Google OAuth.
- **Pagamento:** créditos (ex.: 3 declarações por R$ 5) com Stripe ou Mercado Pago/Pix.
- **Rate limit:** o atual é em memória; em produção com vários workers, mover para KV/D1.
- **Espanhol:** `i18n/locales/es.json`, textos `es` em `shared/samples.ts` e `npm run samples:generate`.
