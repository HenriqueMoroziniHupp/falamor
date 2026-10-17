import type { MaybeRefOrGetter } from 'vue'
import { useIntervalFn, useNow } from '@vueuse/core'

/** Contador ao vivo de tempo juntos ("2 anos, 3 meses e 12 dias") a partir de `yyyy-mm-dd`. */
export function useTogetherCounter(startDate: MaybeRefOrGetter<string | null>) {
  const { t, locale } = useI18n()
  const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 1000) })

  const start = computed(() => parseLocalDate(toValue(startDate)))
  const duration = computed(() => (start.value ? diffTogether(start.value, now.value) : null))

  const summary = computed(() => {
    const d = duration.value
    if (!d) return null
    const parts = [
      d.years ? t('together.years', d.years) : '',
      d.months ? t('together.months', d.months) : '',
      d.days ? t('together.days', d.days) : '',
    ].filter(Boolean)
    if (!parts.length) return t('together.today')
    return t('together.summary', { time: new Intl.ListFormat(locale.value, { type: 'conjunction' }).format(parts) })
  })

  return { duration, summary }
}
