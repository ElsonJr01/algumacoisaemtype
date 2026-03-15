import { Usuario } from '../entidades/Usuario';
import { Imovel } from '../entidades/Imovel';
import { Documento } from '../entidades/Documento';
import { Solicitacao } from '../entidades/Solicitacao';

export interface IUsuarioRepositorio {
  criar(usuario: Omit<Usuario, 'id'>): Promise<Usuario>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  listar(): Promise<Usuario[]>;
  atualizar(id: string, dados: Partial<Usuario>): Promise<Usuario | null>;
}

export interface IImovelRepositorio {
  criar(imovel: Omit<Imovel, 'id'>): Promise<Imovel>;
  buscarPorId(id: string): Promise<Imovel | null>;
  buscarPorProtocolo(protocolo: string): Promise<Imovel | null>;
  listar(filtros?: Partial<Imovel>, pagina?: number, limite?: number): Promise<{ imoveis: Imovel[]; total: number }>;
  atualizar(id: string, dados: Partial<Imovel>): Promise<Imovel | null>;
  deletar(id: string): Promise<void>;
}

export interface IDocumentoRepositorio {
  criar(doc: Omit<Documento, 'id'>): Promise<Documento>;
  buscarPorId(id: string): Promise<Documento | null>;
  listar(filtros?: Partial<Documento>, pagina?: number, limite?: number): Promise<{ documentos: Documento[]; total: number }>;
  listarPublicos(filtros?: { categoria?: string; busca?: string }, pagina?: number, limite?: number): Promise<{ documentos: Documento[]; total: number }>;
  atualizar(id: string, dados: Partial<Documento>): Promise<Documento | null>;
  deletar(id: string): Promise<void>;
}

export interface ISolicitacaoRepositorio {
  criar(sol: Omit<Solicitacao, 'id'>): Promise<Solicitacao>;
  buscarPorId(id: string): Promise<Solicitacao | null>;
  buscarPorProtocolo(protocolo: string): Promise<Solicitacao | null>;
  listar(filtros?: Partial<Solicitacao>, pagina?: number, limite?: number): Promise<{ solicitacoes: Solicitacao[]; total: number }>;
  atualizar(id: string, dados: Partial<Solicitacao>): Promise<Solicitacao | null>;
}
