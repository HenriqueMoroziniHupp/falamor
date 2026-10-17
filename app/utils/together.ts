export interface TogetherDuration {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

const ZERO: TogetherDuration = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }

/** `yyyy-mm-dd` → meia-noite local (sem fuso UTC, que "voltaria" um dia no Brasil). */
export function parseLocalDate(value: string | null | undefined): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

/** Soma meses mantendo o dia (31/jan + 1 mês = 29/fev, não 2/mar). */
function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const day = Math.min(date.getDate(), daysInMonth(target.getFullYear(), target.getMonth()))
  return new Date(target.getFullYear(), target.getMonth(), day, date.getHours(), date.getMinutes(), date.getSeconds())
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes(), date.getSeconds())
}

/** Diferença de calendário (anos, meses, dias…) — "2 anos, 3 meses e 12 dias". */
export function diffTogether(start: Date, now: Date): TogetherDuration {
  if (now.getTime() <= start.getTime()) return { ...ZERO }

  let totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  let anchor = addMonths(start, totalMonths)
  if (anchor.getTime() > now.getTime()) anchor = addMonths(start, --totalMonths)

  let days = 0
  while (addDays(anchor, days + 1).getTime() <= now.getTime()) days++

  const rest = Math.floor((now.getTime() - addDays(anchor, days).getTime()) / 1000)
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    hours: Math.floor(rest / 3600),
    minutes: Math.floor((rest % 3600) / 60),
    seconds: rest % 60,
  }
}
