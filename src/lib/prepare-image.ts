const MAX_EDGE = 2400

export function prepareImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(url)
        reject(new Error('This browser could not prepare the image.'))
        return
      }
      context.drawImage(image, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (!blob) {
            reject(new Error('This browser could not compress the image.'))
            return
          }
          resolve({ blob, width, height })
        },
        'image/jpeg',
        0.82,
      )
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image. Export it as a normal RGB JPG or PNG.'))
    }
    image.src = url
  })
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result)
      resolve(value.slice(value.indexOf(',') + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the image data.'))
    reader.readAsDataURL(blob)
  })
}

export function imageFileName(original: string) {
  const base = original
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  return `${base || 'image'}-${stamp}.jpg`
}
