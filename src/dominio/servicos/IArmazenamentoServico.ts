export interface ArquivoUpload {
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface ResultadoUpload {
  urlPublica: string;
  publicId: string;
  nomeArquivo: string;
  tipoArquivo: string;
  tamanhoArquivo: number;
}

export interface IArmazenamentoServico {
  upload(arquivo: ArquivoUpload, pasta?: string): Promise<ResultadoUpload>;
  deletar(publicId: string, resourceType?: string): Promise<void>;
}
