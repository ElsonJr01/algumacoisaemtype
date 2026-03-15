import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import { IArmazenamentoServico, ArquivoUpload, ResultadoUpload } from '@dominio/servicos/IArmazenamentoServico';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TIPOS_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
];

export class ArmazenamentoServico implements IArmazenamentoServico {
  async upload(arquivo: ArquivoUpload, pasta?: string): Promise<ResultadoUpload> {
    if (!TIPOS_PERMITIDOS.includes(arquivo.mimetype)) {
      throw new Error('Tipo de arquivo não permitido');
    }

    const maxSize = Number(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024;
    if (arquivo.size > maxSize) {
      throw new Error('Arquivo excede o tamanho máximo permitido (20MB)');
    }

    const isImage = arquivo.mimetype.startsWith('image/');
    const resourceType: 'image' | 'raw' = isImage ? 'image' : 'raw';
    const folder = pasta || process.env.CLOUDINARY_FOLDER || 'regularizaja';

    const resultado = await cloudinary.uploader.upload(arquivo.path, {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      access_mode: 'public',
      type: 'upload',
    });

    try { await fs.unlink(arquivo.path); } catch { /* silencioso */ }

    return {
      urlPublica: resultado.secure_url,
      publicId: resultado.public_id,
      nomeArquivo: arquivo.originalname,
      tipoArquivo: arquivo.mimetype,
      tamanhoArquivo: arquivo.size,
    };
  }

  async deletar(publicId: string, resourceType = 'raw'): Promise<void> {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType as any,
      });
    } catch { /* silencioso */ }
  }
}
