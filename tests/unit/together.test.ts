import { describe, expect, it } from 'vitest'
import { diffTogether, parseLocalDate } from '../../app/utils/together'

describe('parseLocalDate', () => {
  it('parses yyyy-mm-dd as local midnight', () => {
    const date = parseLocalDate('2022-02-14')!
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2022, 1, 14, 0])
  })

  it('returns null for empty or invalid values', () => {
    expect(parseLocalDate(null)).toBeNull()
    expect(parseLocalDate('')).toBeNull()
    expect(parseLocalDate('14/02/2022')).toBeNull()
  })
})

describe('diffTogether', () => {
  it('counts calendar years, months, days and time', () => {
    const start = new Date(2022, 1, 14)
    const now = new Date(2024, 4, 20, 10, 30, 15)
    expect(diffTogether(start, now)).toEqual({ years: 2, months: 3, days: 6, hours: 10, minutes: 30, seconds: 15 })
  })

  it('handles month ends (31 Jan → 1 Mar)', () => {
    const d = diffTogether(new Date(2024, 0, 31), new Date(2024, 2, 1))
    expect(d).toMatchObject({ years: 0, months: 1, days: 1 })
  })

  it('does not count a full month before the day arrives', () => {
    const d = diffTogether(new Date(2024, 0, 20), new Date(2024, 1, 19, 23, 59, 59))
    expect(d).toMatchObject({ months: 0, days: 30, hours: 23 })
  })

  it('returns zero for a future start date', () => {
    expect(diffTogether(new Date(2030, 0, 1), new Date(2024, 0, 1))).toEqual({
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    })
  })
})
