export type CategoriaDocumento =
  | 'identidade'
  | 'cpf'
  | 'comprovante_residencia'
  | 'contrato'
  | 'planta'
  | 'laudo_tecnico'
  | 'memorial_descritivo'
  | 'levantamento_topografico'
  | 'certidao_negativa'
  | 'alvara'
  | 'habite_se'
  | 'matricula'
  | 'iptu'
  | 'escritura'
  | 'outros';

export type EtapaDocumento =
  | 'cadastro'
  | 'engenharia'
  | 'aprovacao'
  | 'cartorio'
  | 'outros';

export type StatusDocumento = 'ativo' | 'inativo' | 'arquivado';
export type VisibilidadeDocumento = 'publico' | 'privado';

export interface Documento {
  id?: string;
  titulo: string;
  categoria: CategoriaDocumento;
  etapa: EtapaDocumento;
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

// Mapa de categoria → etapa
export const CATEGORIA_ETAPA: Record<CategoriaDocumento, EtapaDocumento> = {
  identidade:               'cadastro',
  cpf:                      'cadastro',
  comprovante_residencia:   'cadastro',
  contrato:                 'cadastro',
  planta:                   'engenharia',
  laudo_tecnico:            'engenharia',
  memorial_descritivo:      'engenharia',
  levantamento_topografico: 'engenharia',
  certidao_negativa:        'aprovacao',
  alvara:                   'aprovacao',
  habite_se:                'aprovacao',
  matricula:                'cartorio',
  iptu:                     'cartorio',
  escritura:                'cartorio',
  outros:                   'outros',
};

// Etapas que cada role pode ver
export const ETAPAS_POR_ROLE: Record<string, EtapaDocumento[]> = {
  admin:             ['cadastro', 'engenharia', 'aprovacao', 'cartorio', 'outros'],
  engenheiro:        ['engenharia'],
  assistente_social: ['cadastro', 'aprovacao', 'cartorio', 'outros'],
  usuario:           [],
};