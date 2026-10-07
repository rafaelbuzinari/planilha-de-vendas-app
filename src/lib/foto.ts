const LADO_MAXIMO = 480
const QUALIDADE = 0.8

/**
 * Reduz a foto (de até vários MB, vinda da câmera) para no máximo 480px em JPEG.
 * Fica com uns 30–60 KB: não pesa o banco nem o backup.
 */
export async function reduzirFoto(arquivo: File): Promise<string> {
  const imagem = await createImageBitmap(arquivo)
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height))
  const largura = Math.round(imagem.width * escala)
  const altura = Math.round(imagem.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura
  const contexto = canvas.getContext('2d')
  if (!contexto) throw new Error('Não foi possível processar a foto')
  contexto.fillStyle = '#ffffff' // fundo branco para PNG com transparência
  contexto.fillRect(0, 0, largura, altura)
  contexto.drawImage(imagem, 0, 0, largura, altura)
  imagem.close()

  return canvas.toDataURL('image/jpeg', QUALIDADE)
}
