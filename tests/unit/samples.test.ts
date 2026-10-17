import { describe, expect, it } from 'vitest'
import { DECLARATION_SAMPLES, matchSample, revoiceSampleText, sampleAudioPath, sampleText } from '../../shared/samples'
import { normalizeDeclarationText, randomId, sha256Hex, sha256HexSync } from '../../shared/utils/text'

describe('samples', () => {
  it('has 3 samples with text for every locale and voice', () => {
    expect(DECLARATION_SAMPLES).toHaveLength(3)
    for (const sample of DECLARATION_SAMPLES) {
      for (const byVoice of Object.values(sample.text)) {
        expect(byVoice.female.length).toBeGreaterThan(200)
        expect(byVoice.male.length).toBeGreaterThan(200)
      }
    }
  })

  it('adapts "Obrigado/Obrigada" to the speaker voice in Portuguese', () => {
    expect(sampleText('lugar-favorito', 'pt-BR', 'male')).toContain('Obrigado por cada risada')
    expect(sampleText('lugar-favorito', 'pt-BR', 'female')).toContain('Obrigada por cada risada')
  })

  it('matches a sample only for the same locale and voice (pre-generated audio)', () => {
    const female = sampleText('jeitinho', 'pt-BR', 'female')
    expect(matchSample(female, 'pt-BR', 'female')).toBe('jeitinho')
    expect(matchSample(`  ${female}\n`, 'pt-BR', 'female')).toBe('jeitinho')
    expect(matchSample(female, 'pt-BR', 'male')).toBeNull()
    expect(matchSample(`${female} Mais uma frase.`, 'pt-BR', 'female')).toBeNull()
  })

  it('revoices an unedited sample when the voice changes', () => {
    const male = sampleText('lugar-favorito', 'pt-BR', 'male')
    expect(revoiceSampleText(male, 'female')).toBe(sampleText('lugar-favorito', 'pt-BR', 'female'))
    expect(revoiceSampleText('Um texto qualquer escrito pela pessoa.', 'female')).toBeNull()
  })

  it('builds the static asset path', () => {
    expect(sampleAudioPath('primavera', 'en', 'female')).toBe('/audio/samples/en/primavera-female.mp3')
  })
})

describe('text utils', () => {
  it('normalizes whitespace so the same text reuses the same audio', () => {
    expect(normalizeDeclarationText('  Te  amo.\r\n\r\n\r\nSempre!  ')).toBe('Te amo.\n\nSempre!')
  })

  it('hashes with SHA-256', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })

  it('pure-JS SHA-256 (HTTP sem contexto seguro) bate com o WebCrypto', async () => {
    expect(sha256HexSync('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    for (const text of ['abc', 'Obrigada por cada risada ❤️', 'x'.repeat(1000)]) {
      expect(sha256HexSync(text)).toBe(await sha256Hex(text))
    }
  })

  it('generates unique ids', () => {
    expect(randomId()).not.toBe(randomId())
  })
})
