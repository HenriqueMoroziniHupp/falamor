/**
 * Gera os áudios das declarações de exemplo (uma vez só) em public/audio/samples.
 * Assim os exemplos nunca gastam crédito de API em produção.
 * Também gera os áudios das demonstrações (/d/demo, /en/d/demo-en), os únicos com nome falado.
 *
 *   npm run samples:generate              # gera só o que falta
 *   npm run samples:generate -- --force   # regera tudo
 *   npm run samples:generate -- --audition  # compara vozes candidatas em .data/auditions
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DECLARATION_SAMPLES, sampleAudioPath, sampleText } from '../shared/samples.ts'
import { DEMOS, demoAudioPath, demoText } from '../shared/demo.ts'
import { SUPPORTED_LOCALES, VOICE_GENDERS, type AppLocale, type VoiceGender } from '../shared/types/declaration.ts'
import { createGeminiTtsProvider } from '../server/services/tts/gemini.ts'
import { SPEECH_LANGUAGE, VOICE_STYLES, buildTranscript } from '../server/services/tts/voiceStyle.ts'
import { ensureMp3 } from '../server/services/tts/wavToMp3.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = new Set(process.argv.slice(2))

const apiKey = process.env.NUXT_GEMINI_API_KEY
if (!apiKey) {
  console.error('Defina NUXT_GEMINI_API_KEY no .env antes de rodar este script.')
  process.exit(1)
}

const model = process.env.NUXT_TTS_MODEL || 'gemini-3.8-flash-lite-tts'
const voices: Record<VoiceGender, string> = {
  female: process.env.NUXT_TTS_VOICE_FEMALE || 'Sulafat',
  male: process.env.NUXT_TTS_VOICE_MALE || 'Algieba',
}
const tts = createGeminiTtsProvider({ apiKey, model })

async function synthesizeTo(file: string, text: string, voice: string, locale: AppLocale) {
  const audio = await tts.synthesize({
    text: buildTranscript(text),
    voice,
    style: VOICE_STYLES[locale],
    language: SPEECH_LANGUAGE[locale],
  })
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, ensureMp3(audio))
  console.log(`✓ ${file.replace(`${root}/`, '')}`)
}

if (args.has('--audition')) {
  const candidates: Record<VoiceGender, string[]> = {
    female: ['Sulafat', 'Achernar', 'Vindemiatrix', 'Aoede'],
    male: ['Algieba', 'Enceladus', 'Charon', 'Iapetus'],
  }
  for (const gender of VOICE_GENDERS) {
    for (const voice of candidates[gender]) {
      const file = join(root, '.data/auditions', `${gender}-${voice}.mp3`)
      await synthesizeTo(file, sampleText('lugar-favorito', 'pt-BR', gender), voice, 'pt-BR')
    }
  }
  process.exit(0)
}

let generated = 0
for (const sample of DECLARATION_SAMPLES) {
  for (const locale of SUPPORTED_LOCALES) {
    for (const gender of VOICE_GENDERS) {
      const file = join(root, 'public', sampleAudioPath(sample.id, locale, gender))
      if (existsSync(file) && !args.has('--force')) continue
      await synthesizeTo(file, sampleText(sample.id, locale, gender), voices[gender], locale)
      generated++
    }
  }
}
for (const demo of Object.values(DEMOS)) {
  const file = join(root, 'public', demoAudioPath(demo))
  if (existsSync(file) && !args.has('--force')) continue
  await synthesizeTo(file, demoText(demo), voices[demo.voice], demo.locale)
  generated++
}
console.log(generated ? `${generated} áudio(s) gerado(s).` : 'Todos os áudios já existem (use --force para regerar).')
