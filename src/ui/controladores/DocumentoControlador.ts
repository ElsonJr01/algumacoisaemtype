import { Request, Response } from 'express';
import { DocumentoRepositorio } from '@servicosTecnicos/repositorios/DocumentoRepositorio';
import { ArmazenamentoServico } from '@servicosTecnicos/servicos/ArmazenamentoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const repo = new DocumentoRepositorio();
const storage = new ArmazenamentoServico();

export class DocumentoControlador {
  // ── PÚBLICO ──
  async listarPublicos(req: Request, res: Response): Promise<void> {
    try {
      const { categoria, busca, pagina = '1', limite = '20' } = req.query as any;
      const resultado = await repo.listarPublicos(
        { categoria, busca },
        parseInt(pagina),
        parseInt(limite)
      );
      res.json({
        ...resultado,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(resultado.total / parseInt(limite)),
        limite: parseInt(limite),
      });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async buscarPublicoPorId(req: Request, res: Response): Promise<void> {
    try {
      const doc = await repo.buscarPorId(req.params.id);
      if (!doc || doc.status !== 'ativo' || doc.visibilidade !== 'publico') {
        res.status(404).json({ erro: 'Documento não encontrado' });
        return;
      }
      res.json(doc);
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async download(req: Request, res: Response): Promise<void> {
    try {
      const doc = await repo.buscarPorId(req.params.id);
      if (!doc || !doc.urlPublica) {
        res.status(404).json({ erro: 'Documento não encontrado' });
        return;
      }
      res.redirect(doc.urlPublica);
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  // ── ADMIN ──
  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { categoria, status, busca, imovelId, pagina = '1', limite = '20' } = req.query as any;
      const resultado = await repo.listar(
        { categoria, status, busca, imovelId },
        parseInt(pagina),
        parseInt(limite)
      );
      res.json({
        ...resultado,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(resultado.total / parseInt(limite)),
        limite: parseInt(limite),
      });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      if (!req.file) { res.status(400).json({ erro: 'Arquivo é obrigatório' }); return; }
      const { titulo, categoria, nota, data, visibilidade, imovelId } = req.body;
      if (!titulo || !categoria) {
        res.status(400).json({ erro: 'Título e categoria são obrigatórios' });
        return;
      }
      const resultado = await storage.upload(req.file as any, `regularizaja/documentos`);
      const doc = await repo.criar({
        titulo, categoria, nota, data,
        nomeArquivo: resultado.nomeArquivo,
        tipoArquivo: resultado.tipoArquivo,
        tamanhoArquivo: resultado.tamanhoArquivo,
        status: 'ativo',
        visibilidade: visibilidade || 'privado',
        urlPublica: resultado.urlPublica,
        publicId: resultado.publicId,
        imovelId,
        criadoPorId: req.usuario?.usuarioId,
      });
      res.status(201).json(doc);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async atualizar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { titulo, nota, status, visibilidade, categoria } = req.body;
      const doc = await repo.atualizar(req.params.id, { titulo, nota, status, visibilidade, categoria });
      if (!doc) { res.status(404).json({ erro: 'Documento não encontrado' }); return; }
      res.json(doc);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async deletar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const doc = await repo.buscarPorId(req.params.id);
      if (!doc) { res.status(404).json({ erro: 'Documento não encontrado' }); return; }
      if (doc.publicId) await storage.deletar(doc.publicId);
      await repo.deletar(req.params.id);
      res.json({ mensagem: 'Documento excluído com sucesso' });
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }
}
