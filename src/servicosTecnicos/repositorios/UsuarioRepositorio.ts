import { IUsuarioRepositorio } from '@dominio/repositorios/index';
import { Usuario } from '@dominio/entidades/Usuario';
import { UsuarioModel } from '@servicosTecnicos/database/schemas/UsuarioSchema';

export class UsuarioRepositorio implements IUsuarioRepositorio {
  private mapear(doc: any): Usuario {
    return {
      id: doc._id.toString(),
      nome: doc.nome,
      email: doc.email,
      senhaHash: doc.senhaHash,
      role: doc.role,
      ativo: doc.ativo,
      criadoEm: doc.criadoEm,
      atualizadoEm: doc.atualizadoEm,
    };
  }

  async criar(dados: Omit<Usuario, 'id'>): Promise<Usuario> {
    const doc = await UsuarioModel.create(dados);
    return this.mapear(doc);
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const doc = await UsuarioModel.findOne({ email: email.toLowerCase() });
    return doc ? this.mapear(doc) : null;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const doc = await UsuarioModel.findById(id);
    return doc ? this.mapear(doc) : null;
  }

  async listar(): Promise<Usuario[]> {
    const docs = await UsuarioModel.find({ ativo: true }).sort({ criadoEm: -1 });
    return docs.map(this.mapear);
  }

  async atualizar(id: string, dados: Partial<Usuario>): Promise<Usuario | null> {
    const doc = await UsuarioModel.findByIdAndUpdate(id, dados, { new: true });
    return doc ? this.mapear(doc) : null;
  }
}
