import { describe, expect, it } from 'vitest'
import { DEMO_PARTNER_NAME, demoText, withPartnerName } from '../../shared/demo'
import { DECLARATION_SAMPLES, matchSample } from '../../shared/samples'

describe('demo', () => {
  it('opens and closes the declaration with the partner name', () => {
    expect(withPartnerName('Desde que você chegou. Eu te amo infinitamente!', 'Helena')).toBe(
      'Helena, desde que você chegou. Eu te amo infinitamente, Helena!',
    )
    expect(demoText()).toMatch(/^Helena, desde que você entrou na minha vida/)
    expect(demoText()).toMatch(/Eu te amo infinitamente, Helena!$/)
  })

  it('keeps the name out of the shared samples', () => {
    expect(matchSample(demoText(), 'pt-BR', 'male')).toBeNull()
    for (const sample of DECLARATION_SAMPLES) {
      for (const byVoice of Object.values(sample.text)) {
        expect(Object.values(byVoice).join(' ')).not.toContain(DEMO_PARTNER_NAME)
      }
    }
  })
})
