import { IDocumentoRepositorio } from '@dominio/repositorios/index';
import { Documento } from '@dominio/entidades/Documento';
import { DocumentoModel } from '@servicosTecnicos/database/schemas/DocumentoSchema';

export class DocumentoRepositorio implements IDocumentoRepositorio {
  private mapear(doc: any): Documento {
    return {
      id: doc._id.toString(),
      titulo: doc.titulo,
      categoria: doc.categoria,
      etapa: doc.etapa,
      nota: doc.nota,
      data: doc.data,
      nomeArquivo: doc.nomeArquivo,
      tipoArquivo: doc.tipoArquivo,
      tamanhoArquivo: doc.tamanhoArquivo,
      status: doc.status,
      visibilidade: doc.visibilidade,
      urlPublica: doc.urlPublica,
      publicId: doc.publicId,
      imovelId: doc.imovelId,
      criadoPorId: doc.criadoPorId,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm,
    };
  }

  async criar(dados: Omit<Documento, 'id'>): Promise<Documento> {
    return this.mapear(await DocumentoModel.create(dados));
  }

  async buscarPorId(id: string): Promise<Documento | null> {
    const doc = await DocumentoModel.findById(id);
    return doc ? this.mapear(doc) : null;
  }

  async listar(filtros?: any, pagina = 1, limite = 20) {
    const query: any = { status: { $ne: 'inativo' } };
    if (filtros?.status) query.status = filtros.status;
    if (filtros?.categoria) query.categoria = filtros.categoria;
    if (filtros?.etapa) query.etapa = filtros.etapa;
    if (filtros?.imovelId) query.imovelId = filtros.imovelId;
    if (filtros?.visibilidade) query.visibilidade = filtros.visibilidade;
    if (filtros?.busca) query.$or = [
      { titulo: { $regex: filtros.busca, $options: 'i' } },
      { nota: { $regex: filtros.busca, $options: 'i' } },
    ];
    const skip = (pagina - 1) * limite;
    const [docs, total] = await Promise.all([
      DocumentoModel.find(query).sort({ criadoEm: -1 }).skip(skip).limit(limite),
      DocumentoModel.countDocuments(query),
    ]);
    return { documentos: docs.map(d => this.mapear(d)), total };
  }

  async listarPublicos(filtros?: any, pagina = 1, limite = 20) {
    const query: any = { status: 'ativo', visibilidade: 'publico' };
    if (filtros?.categoria) query.categoria = filtros.categoria;
    if (filtros?.busca) query.$or = [
      { titulo: { $regex: filtros.busca, $options: 'i' } },
      { nota: { $regex: filtros.busca, $options: 'i' } },
    ];
    const skip = (pagina - 1) * limite;
    const [docs, total] = await Promise.all([
      DocumentoModel.find(query).sort({ criadoEm: -1 }).skip(skip).limit(limite),
      DocumentoModel.countDocuments(query),
    ]);
    return { documentos: docs.map(d => this.mapear(d)), total };
  }

  async atualizar(id: string, dados: Partial<Documento>): Promise<Documento | null> {
    const doc = await DocumentoModel.findByIdAndUpdate(id, { $set: dados }, { new: true });
    return doc ? this.mapear(doc) : null;
  }

  async deletar(id: string): Promise<void> {
    await DocumentoModel.findByIdAndUpdate(id, { status: 'inativo' });
  }
}