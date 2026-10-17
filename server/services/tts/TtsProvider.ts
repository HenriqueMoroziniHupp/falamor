export interface TtsSynthesisRequest {
  /** Transcrição lida literalmente. */
  text: string
  /** Nome da voz do provedor (ex.: "Sulafat"). */
  voice: string
  /** Instrução de entrega (emoção, ritmo, tom). */
  style: string
  /** BCP-47, ex.: "pt-BR". */
  language: string
}

export interface TtsAudio {
  data: Uint8Array
  mimeType: string
  sampleRate?: number
  channels?: number
}

/** Contrato para trocar de provedor de voz sem mexer no endpoint. */
export interface TtsProvider {
  synthesize(request: TtsSynthesisRequest): Promise<TtsAudio>
}
