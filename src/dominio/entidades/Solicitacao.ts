export type StatusSolicitacao =
  | 'nova'
  | 'em_analise'
  | 'aprovada'
  | 'rejeitada'
  | 'convertida';

export interface Solicitacao {
  id?: string;
  protocolo?: string;
  // Dados pessoais
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  // Dados do imóvel
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  areaM2?: number;
  tipoImovel: string;
  // Situação documental
  temDocumento: string;
  situacao: string;
  observacoes?: string;
  // Controle
  status: StatusSolicitacao;
  imovelId?: string;
  responsavelId?: string;
  criadoEm?: Date;
  atualizadoEm?: Date;
}
