export type CategoriaDocumento =
  | 'ata'
  | 'balancete'
  | 'relatorio'
  | 'estatuto'
  | 'contrato'
  | 'planta'
  | 'matricula'
  | 'escritura'
  | 'iptu'
  | 'identidade'
  | 'cpf'
  | 'comprovante_residencia'
  | 'habite_se'
  | 'laudo_tecnico'
  | 'memorial_descritivo'
  | 'certidao_negativa'
  | 'levantamento_topografico'
  | 'alvara'
  | 'outros';

export type StatusDocumento = 'ativo' | 'inativo' | 'arquivado';
export type VisibilidadeDocumento = 'publico' | 'privado';

export interface Documento {
  id?: string;
  titulo: string;
  categoria: CategoriaDocumento;
  nota?: string;
  data?: string;
  nomeArquivo?: string;
  tipoArquivo: string;
  tamanhoArquivo: number;
  status: StatusDocumento;
  visibilidade: VisibilidadeDocumento;
  urlPublica?: string;
  publicId?: string;
  imovelId?: string;
  criadoPorId?: string;
  criadoEm?: Date;
  atualizadoEm?: Date;
}