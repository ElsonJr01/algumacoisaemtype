import { Response } from 'express';
import { DocumentoRepositorio } from '@servicosTecnicos/repositorios/DocumentoRepositorio';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';
import { CATEGORIA_ETAPA, ETAPAS_POR_ROLE, CategoriaDocumento } from '@dominio/entidades/Documento';

const repo = new DocumentoRepositorio();
const storage = new ArmazenamentoServico();

// Retorna etapas visíveis para o role
function etapasDoRole(role: string): string[] {
  return ETAPAS_POR_ROLE[role] || [];
}

export class DocumentoControlador {

  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const role = req.usuario?.role || 'usuario';
      const etapas = etapasDoRole(role);

      // Admin vê tudo; outros veem só suas etapas
      const filtros: any = { status: 'ativo' };
      if (role !== 'admin') {
        if (etapas.length === 0) { res.json({ documentos: [], total: 0 }); return; }
        filtros.etapa = { $in: etapas };
      }
      const resultado = await repo.listar(filtros);
      res.json({ documentos: resultado.documentos, total: resultado.total });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async listarPublicos(_req: any, res: Response): Promise<void> {
    try {
      const resultado = await repo.listar({ visibilidade: 'publico', status: 'ativo' });
      res.json({ documentos: resultado.documentos, total: resultado.total });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async buscarPublicoPorId(req: any, res: Response): Promise<void> {
    try {
      const doc = await repo.buscarPorId(req.params.id);
      if (!doc || doc.visibilidade !== 'publico') {
        res.status(404).json({ erro: 'Documento não encontrado' }); return;
      }
      res.json(doc);
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const role = req.usuario?.role || 'usuario';
      const { titulo, categoria, nota, data, visibilidade } = req.body;

      if (!titulo) { res.status(400).json({ erro: 'Título é obrigatório' }); return; }
      if (!req.file) { res.status(400).json({ erro: 'Arquivo é obrigatório' }); return; }

      // Determina etapa pela categoria automaticamente
      const etapa = CATEGORIA_ETAPA[categoria as CategoriaDocumento] || 'outros';

      // Verifica se o role pode criar nesta etapa
      if (role !== 'admin' && !etapasDoRole(role).includes(etapa)) {
        res.status(403).json({ erro: 'Você não tem permissão para criar documentos desta etapa' });
        return;
      }

      const uploadResult = await storage.upload(req.file);

      const doc = await repo.criar({
        titulo,
        categoria: categoria || 'outros',
        etapa,
        nota,
        data,
        nomeArquivo: req.file.originalname,
        tipoArquivo: req.file.mimetype,
        tamanhoArquivo: req.file.size,
        status: 'ativo',
        visibilidade: visibilidade || 'privado',
        urlPublica: uploadResult.urlPublica,
        publicId: uploadResult.publicId,
        criadoPorId: req.usuario?.usuarioId,
      });

      res.status(201).json(doc);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const role = req.usuario?.role || 'usuario';
      const doc = await repo.buscarPorId(req.params.id);
      if (!doc) { res.status(404).json({ erro: 'Documento não encontrado' }); return; }

      // Verifica permissão pela etapa do documento
      if (role !== 'admin' && !etapasDoRole(role).includes(doc.etapa || 'outros')) {
        res.status(403).json({ erro: 'Sem permissão para editar documentos desta etapa' });
        return;
      }

      const { titulo, categoria, nota, data, visibilidade, status } = req.body;

      // Recalcula etapa se categoria mudou
      const novaEtapa = categoria
        ? CATEGORIA_ETAPA[categoria as CategoriaDocumento] || 'outros'
        : doc.etapa;

      const atualizado = await repo.atualizar(req.params.id, {
        titulo, categoria, etapa: novaEtapa, nota, data, visibilidade, status,
      });
      res.json(atualizado);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const doc = await repo.buscarPorId(req.params.id);
      if (!doc) { res.status(404).json({ erro: 'Documento não encontrado' }); return; }
      if (doc.publicId) await storage.deletar(doc.publicId).catch(() => {});
      await repo.deletar(req.params.id);
      res.json({ mensagem: 'Documento excluído com sucesso' });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async download(req: any, res: Response): Promise<void> {
    try {
      const doc = await repo.buscarPorId(req.params.id);
      if (!doc || doc.visibilidade !== 'publico') {
        res.status(404).json({ erro: 'Documento não encontrado' }); return;
      }
      res.redirect(doc.urlPublica + '?fl_attachment=true');
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}