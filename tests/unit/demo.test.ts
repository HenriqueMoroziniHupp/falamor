import { describe, expect, it } from 'vitest'
import { DEMOS, demoAudioPath, demoText, withPartnerName } from '../../shared/demo'
import { DECLARATION_SAMPLES, matchSample } from '../../shared/samples'

describe('demo', () => {
  it('opens and closes the declaration with the partner name', () => {
    expect(withPartnerName('Desde que você chegou. Eu te amo infinitamente!', 'Helena')).toBe(
      'Helena, desde que você chegou. Eu te amo infinitamente, Helena!',
    )
    expect(demoText(DEMOS['pt-BR'])).toMatch(/^Helena, desde que você entrou na minha vida/)
    expect(demoText(DEMOS['pt-BR'])).toMatch(/Eu te amo infinitamente, Helena!$/)
    expect(demoText(DEMOS.en)).toMatch(/^Noah, if I could hold time/)
    expect(demoText(DEMOS.en)).toMatch(/my heart is yours, Noah\.$/)
  })

  it('keeps "I" capitalized after the name', () => {
    expect(withPartnerName('I love you.', 'Noah')).toBe('Noah, I love you, Noah.')
  })

  it('has one demo per locale with its own audio file', () => {
    expect(demoAudioPath(DEMOS['pt-BR'])).toBe('/audio/demo/demo-male.mp3')
    expect(demoAudioPath(DEMOS.en)).toBe('/audio/demo/demo-en-female.mp3')
  })

  it('keeps the names out of the shared samples', () => {
    for (const demo of Object.values(DEMOS)) {
      expect(matchSample(demoText(demo), demo.locale, demo.voice)).toBeNull()
      for (const sample of DECLARATION_SAMPLES) {
        for (const byVoice of Object.values(sample.text)) {
          expect(Object.values(byVoice).join(' ')).not.toContain(demo.partnerName)
        }
      }
    }
  })
})
