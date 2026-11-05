export const isImageOutput = (value) => typeof value === 'string' &&
  (/^data:image\/(png|jpeg|webp|svg\+xml)[;,]/.test(value) || /^https?:\/\//.test(value))

export const downloadOutput = async (output, name = 'creation') => {
  const image = isImageOutput(output)
  const blob = image ? await (await fetch(output)).blob() : new Blob([output], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const extension = image ? ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg' }[blob.type] || 'png') : 'txt'
  anchor.href = url
  anchor.download = `${name}.${extension}`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
