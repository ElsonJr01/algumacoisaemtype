import { IImovelRepositorio } from '@dominio/repositorios/index';
import { Imovel } from '@dominio/entidades/Imovel';
import { ImovelModel } from '@servicosTecnicos/database/schemas/ImovelSchema';

export class ImovelRepositorio implements IImovelRepositorio {
  private mapear(doc: any): Imovel {
    return {
      id: doc._id.toString(),
      protocolo: doc.protocolo,
      proprietarioId: doc.proprietarioId,
      proprietarioNome: doc.proprietarioNome,
      proprietarioCpf: doc.proprietarioCpf,
      proprietarioTelefone: doc.proprietarioTelefone,
      proprietarioEmail: doc.proprietarioEmail,
      tipo: doc.tipo,
      endereco: doc.endereco,
      areaM2: doc.areaM2,
      situacaoDocumental: doc.situacaoDocumental,
      temDocumento: doc.temDocumento,
      observacoes: doc.observacoes,
      status: doc.status,
      engenheiroId: doc.engenheiroId,
      assistenteSocialId: doc.assistenteSocialId,
      documentos: doc.documentos,
      historico: doc.historico,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm,
    };
  }

  async criar(dados: Omit<Imovel, 'id'>): Promise<Imovel> {
    const doc = await ImovelModel.create(dados);
    return this.mapear(doc);
  }

  async buscarPorId(id: string): Promise<Imovel | null> {
    const doc = await ImovelModel.findById(id);
    return doc ? this.mapear(doc) : null;
  }

  async buscarPorProtocolo(protocolo: string): Promise<Imovel | null> {
    const doc = await ImovelModel.findOne({ protocolo });
    return doc ? this.mapear(doc) : null;
  }

  async listar(
    filtros?: Partial<Imovel>,
    pagina = 1,
    limite = 20
  ): Promise<{ imoveis: Imovel[]; total: number }> {
    const query: any = {};
    if (filtros?.status) query.status = filtros.status;
    if (filtros?.engenheiroId) query.engenheiroId = filtros.engenheiroId;

    const skip = (pagina - 1) * limite;
    const [docs, total] = await Promise.all([
      ImovelModel.find(query).sort({ criadoEm: -1 }).skip(skip).limit(limite),
      ImovelModel.countDocuments(query),
    ]);

    return { imoveis: docs.map(this.mapear), total };
  }

  async atualizar(id: string, dados: Partial<Imovel>): Promise<Imovel | null> {
    const doc = await ImovelModel.findByIdAndUpdate(
      id,
      { $set: dados },
      { new: true }
    );
    return doc ? this.mapear(doc) : null;
  }

  async deletar(id: string): Promise<void> {
    await ImovelModel.findByIdAndDelete(id);
  }
}
