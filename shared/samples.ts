import type { AppLocale, VoiceGender } from './types/declaration.ts'
import { normalizeDeclarationText } from './utils/text.ts'

export const SAMPLE_IDS = ['lugar-favorito', 'jeitinho', 'primavera'] as const
export type SampleId = (typeof SAMPLE_IDS)[number]

export interface DeclarationSample {
  id: SampleId
  title: Record<AppLocale, string>
  /** Texto por idioma e por quem fala ("Obrigado"/"Obrigada"). Sem nomes, para o áudio ser pré-gerado. */
  text: Record<AppLocale, Record<VoiceGender, string>>
}

/** Mesmo texto para as duas vozes (idiomas sem flexão de gênero na frase). */
function both(text: string): Record<VoiceGender, string> {
  return { female: text, male: text }
}

export const DECLARATION_SAMPLES: readonly DeclarationSample[] = [
  {
    id: 'lugar-favorito',
    title: { 'pt-BR': 'Meu lugar favorito', en: 'My favorite place' },
    text: {
      'pt-BR': {
        male: 'Desde que você entrou na minha vida, cada dia ganhou uma cor diferente e um sentido muito mais bonito. Olhar para essas fotos é reviver a certeza de que o meu lugar favorito no mundo é dentro do seu abraço. Obrigado por cada risada compartilhada, por cada sonho que construímos juntos e por ser a minha paz em meio à correria do mundo. Que o nosso tempo juntos continue crescendo, segundo após segundo, porque amar você é a melhor parte da minha história. Eu te amo infinitamente!',
        female: 'Desde que você entrou na minha vida, cada dia ganhou uma cor diferente e um sentido muito mais bonito. Olhar para essas fotos é reviver a certeza de que o meu lugar favorito no mundo é dentro do seu abraço. Obrigada por cada risada compartilhada, por cada sonho que construímos juntos e por ser a minha paz em meio à correria do mundo. Que o nosso tempo juntos continue crescendo, segundo após segundo, porque amar você é a melhor parte da minha história. Eu te amo infinitamente!',
      },
      en: both(
        'Ever since you walked into my life, every day has taken on a new color and a far more beautiful meaning. Looking at these photos is reliving the certainty that my favorite place in the world is inside your arms. Thank you for every laugh we have shared, for every dream we have built together, and for being my peace in the middle of this rushing world. May our time together keep growing, second after second, because loving you is the best part of my story. I love you endlessly!',
      ),
    },
  },
  {
    id: 'jeitinho',
    title: { 'pt-BR': 'Do jeitinho da gente', en: 'Just like us' },
    text: {
      'pt-BR': {
        male: 'Eu poderia dizer que você é a pessoa mais linda do mundo, mas isso você já sabe. Então vou dizer outra coisa: você é a minha pessoa favorita para não fazer nada, para rir de bobeira e para dividir a última fatia de pizza. Com você, até a fila do mercado vira encontro. Obrigado por me escolher todos os dias, até naqueles em que eu acordo de mau humor e roubo o cobertor. Prometo continuar te fazendo rir e te amando mais a cada foto nova. Te amo, e não é pouquinho!',
        female: 'Eu poderia dizer que você é a pessoa mais linda do mundo, mas isso você já sabe. Então vou dizer outra coisa: você é a minha pessoa favorita para não fazer nada, para rir de bobeira e para dividir a última fatia de pizza. Com você, até a fila do mercado vira encontro. Obrigada por me escolher todos os dias, até naqueles em que eu acordo de mau humor e roubo o cobertor. Prometo continuar te fazendo rir e te amando mais a cada foto nova. Te amo, e não é pouquinho!',
      },
      en: both(
        "I could tell you that you are the most beautiful person in the world, but you already know that. So let me tell you something else: you are my favorite person to do absolutely nothing with, to laugh at silly things with, and to share the last slice of pizza with. With you, even the grocery line feels like a date. Thank you for choosing me every single day, even on the days I wake up grumpy and steal the blanket. I promise to keep making you laugh and to love you more with every new photo. I love you, and not just a little!",
      ),
    },
  },
  {
    id: 'primavera',
    title: { 'pt-BR': 'Como a primavera', en: 'Like spring' },
    text: {
      'pt-BR': both(
        'Se eu pudesse guardar o tempo, guardaria cada instante ao seu lado: o seu sorriso pela manhã, o som da sua risada, o jeito que o mundo silencia quando você segura a minha mão. Você chegou devagar, como a primavera, e de repente tudo em mim floresceu. Nestas fotos estão pedaços da nossa história, mas o que eu sinto não cabe em nenhuma imagem. Eu prometo cuidar de você, celebrar as suas conquistas e ser abrigo nos dias de chuva. Hoje e sempre, o meu coração é seu.',
      ),
      en: both(
        'If I could hold time in my hands, I would keep every moment by your side: your smile in the morning, the sound of your laughter, the way the world goes quiet when you take my hand. You arrived slowly, like spring, and suddenly everything in me began to bloom. These photos hold pieces of our story, but what I feel could never fit inside a picture. I promise to take care of you, to celebrate your victories, and to be your shelter on rainy days. Today and always, my heart is yours.',
      ),
    },
  },
]

export function getSample(id: SampleId): DeclarationSample {
  const sample = DECLARATION_SAMPLES.find((s) => s.id === id)
  if (!sample) throw new Error(`Unknown sample: ${id}`)
  return sample
}

export function sampleText(id: SampleId, locale: AppLocale, voice: VoiceGender): string {
  return getSample(id).text[locale][voice]
}

/** Caminho público do áudio pré-gerado (sem custo de API). */
export function sampleAudioPath(id: SampleId, locale: AppLocale, voice: VoiceGender): string {
  return `/audio/samples/${locale}/${id}-${voice}.mp3`
}

/**
 * Descobre se o texto é exatamente um dos exemplos naquele idioma e voz.
 * Só nesse caso dá para usar o áudio pré-gerado.
 */
export function matchSample(text: string, locale: AppLocale, voice: VoiceGender): SampleId | null {
  const normalized = normalizeDeclarationText(text)
  const match = DECLARATION_SAMPLES.find((s) => normalizeDeclarationText(s.text[locale][voice]) === normalized)
  return match?.id ?? null
}

/**
 * Se o texto é um exemplo (em qualquer idioma/voz), devolve a variante para a nova voz.
 * Ex.: trocar para voz feminina transforma "Obrigado" em "Obrigada". Null se não for exemplo.
 */
export function revoiceSampleText(text: string, voice: VoiceGender): string | null {
  const normalized = normalizeDeclarationText(text)
  for (const sample of DECLARATION_SAMPLES) {
    for (const byVoice of Object.values(sample.text)) {
      if (Object.values(byVoice).some((t) => normalizeDeclarationText(t) === normalized)) return byVoice[voice]
    }
  }
  return null
}
