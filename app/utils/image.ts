export interface ProcessedImage {
  blob: Blob
  width: number
  height: number
}

/**
 * Redimensiona e comprime no navegador (lado maior ≤ maxSide, JPEG).
 * Corrige a rotação do EXIF e reduz fotos de 5–10 MB para ~300–600 KB.
 */
export async function compressImage(file: File, { maxSide = 1600, quality = 0.85 } = {}): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D unavailable')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) throw new Error('Could not encode image')
    return { blob, width, height }
  } finally {
    bitmap.close()
  }
}
