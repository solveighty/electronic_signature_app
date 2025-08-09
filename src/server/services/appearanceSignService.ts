import axios from 'axios';

type AppearanceSignParams = {
  pdfBuffer: Buffer;
  p12Buffer: Buffer;
  passphrase?: string;
  stampImageBase64: string;
  x?: number;
  y?: number;
  page?: number; 
  userName?: string;
  userId?: string;
};

/**
 * Llama a un microservicio externo que agrega una apariencia visible (imagen)
 * y firma el PDF de forma incremental para no invalidar firmas previas.
 *
 * Requiere la variable de entorno APPEARANCE_SIGNER_URL apuntando al servicio.
 */
export async function signWithAppearanceImage(params: AppearanceSignParams): Promise<Buffer> {
  const baseUrl = process.env.APPEARANCE_SIGNER_URL;
  if (!baseUrl) {
    throw new Error('APPEARANCE_SIGNER_URL no está configurado');
  }

  // Normalizamos imagen
  const stamp = params.stampImageBase64.startsWith('data:')
    ? params.stampImageBase64
    : `data:image/png;base64,${params.stampImageBase64}`;

  const payload = {
    pdf: params.pdfBuffer.toString('base64'),
    p12: params.p12Buffer.toString('base64'),
    passphrase: params.passphrase || '',
    stampImageBase64: stamp,
    x: params.x,
    y: params.y,
    page: params.page,
    userName: params.userName,
    userId: params.userId,
  };

  const url = `${baseUrl.replace(/\/$/, '')}/sign`;
  const res = await axios.post(url, payload, { timeout: 60000 });
  if (!res.data || typeof res.data.pdf !== 'string') {
    throw new Error('Respuesta inválida del microservicio de apariencia');
  }
  return Buffer.from(res.data.pdf, 'base64');
}
