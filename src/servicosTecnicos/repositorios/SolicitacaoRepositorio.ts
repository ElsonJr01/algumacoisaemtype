import { ISolicitacaoRepositorio } from '@dominio/repositorios/index';
import { Solicitacao } from '@dominio/entidades/Solicitacao';
import { SolicitacaoModel } from '@servicosTecnicos/database/schemas/SolicitacaoSchema';

export class SolicitacaoRepositorio implements ISolicitacaoRepositorio {
  private mapear(doc: any): Solicitacao {
    return {
      id: doc._id.toString(),
      protocolo: doc.protocolo,
      nome: doc.nome, cpf: doc.cpf, telefone: doc.telefone, email: doc.email,
      cep: doc.cep, endereco: doc.endereco, numero: doc.numero,
      bairro: doc.bairro, cidade: doc.cidade, estado: doc.estado,
      areaM2: doc.areaM2, tipoImovel: doc.tipoImovel,
      temDocumento: doc.temDocumento, situacao: doc.situacao, observacoes: doc.observacoes,
      status: doc.status, imovelId: doc.imovelId, responsavelId: doc.responsavelId,
      criadoEm: doc.criadoEm, atualizadoEm: doc.atualizadoEm,
    };
  }

  async criar(dados: Omit<Solicitacao, 'id'>): Promise<Solicitacao> {
    return this.mapear(await SolicitacaoModel.create(dados));
  }

  async buscarPorId(id: string): Promise<Solicitacao | null> {
    const doc = await SolicitacaoModel.findById(id);
    return doc ? this.mapear(doc) : null;
  }

  async buscarPorProtocolo(protocolo: string): Promise<Solicitacao | null> {
    const doc = await SolicitacaoModel.findOne({ protocolo });
    return doc ? this.mapear(doc) : null;
  }

  async listar(filtros?: any, pagina = 1, limite = 20) {
    const query: any = {};
    if (filtros?.status) query.status = filtros.status;
    const skip = (pagina - 1) * limite;
    const [docs, total] = await Promise.all([
      SolicitacaoModel.find(query).sort({ criadoEm: -1 }).skip(skip).limit(limite),
      SolicitacaoModel.countDocuments(query),
    ]);
    return { solicitacoes: docs.map(this.mapear), total };
  }

  async atualizar(id: string, dados: Partial<Solicitacao>): Promise<Solicitacao | null> {
    const doc = await SolicitacaoModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return doc ? this.mapear(doc) : null;
  }
}
