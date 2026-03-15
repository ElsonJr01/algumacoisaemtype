export type StatusImovel =
  | 'cadastrado'
  | 'em_analise'
  | 'vistoria_agendada'
  | 'documentacao_pendente'
  | 'em_aprovacao'
  | 'aprovado'
  | 'cartorio'
  | 'matriculado'
  | 'cancelado';

export type TipoImovel = 'casa' | 'apartamento' | 'lote' | 'comercial' | 'outro';

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Imovel {
  id?: string;
  protocolo?: string;
  proprietarioId: string;
  proprietarioNome: string;
  proprietarioCpf: string;
  proprietarioTelefone: string;
  proprietarioEmail?: string;
  tipo: TipoImovel;
  endereco: Endereco;
  areaM2?: number;
  situacaoDocumental: string;
  temDocumento: string;
  observacoes?: string;
  status: StatusImovel;
  engenheiroId?: string;
  assistenteSocialId?: string;
  documentos?: string[];
  historico?: HistoricoItem[];
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export interface HistoricoItem {
  status: StatusImovel;
  descricao: string;
  usuarioId?: string;
  usuarioNome?: string;
  data: Date;
}
