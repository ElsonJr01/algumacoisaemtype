import { Request, Response } from 'express';
import { ImovelRepositorio } from '@servicosTecnicos/repositorios/ImovelRepositorio';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';
import { HistoricoItem } from '@dominio/entidades/Imovel';

const repo = new ImovelRepositorio();

export class ImovelControlador {
  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { status, pagina = '1', limite = '20' } = req.query as any;
      const filtros: any = {};
      if (status) filtros.status = status;
      if (req.usuario?.role === 'engenheiro') filtros.engenheiroId = req.usuario.usuarioId;
      const resultado = await repo.listar(filtros, parseInt(pagina), parseInt(limite));
      res.json({
        ...resultado,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(resultado.total / parseInt(limite)),
      });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async buscarPorId(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const imovel = await repo.buscarPorId(req.params.id);
      if (!imovel) { res.status(404).json({ erro: 'Imóvel não encontrado' }); return; }
      res.json(imovel);
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async buscarPorProtocolo(req: Request, res: Response): Promise<void> {
    try {
      const imovel = await repo.buscarPorProtocolo(req.params.protocolo);
      if (!imovel) { res.status(404).json({ erro: 'Protocolo não encontrado' }); return; }
      res.json({
        protocolo: imovel.protocolo,
        status: imovel.status,
        proprietarioNome: imovel.proprietarioNome,
        endereco: imovel.endereco,
        historico: imovel.historico,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async criar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const dados = req.body;
      if (!dados.proprietarioNome || !dados.proprietarioCpf || !dados.proprietarioTelefone) {
        res.status(400).json({ erro: 'Nome, CPF e telefone do proprietário são obrigatórios' });
        return;
      }
      const imovel = await repo.criar({
        ...dados,
        status: 'cadastrado',
        historico: [{
          status: 'cadastrado',
          descricao: 'Imóvel cadastrado na plataforma',
          usuarioId: req.usuario?.usuarioId,
          usuarioNome: req.usuario?.email,
          data: new Date(),
        }],
      });
      res.status(201).json(imovel);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async atualizarStatus(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { status, descricao } = req.body;
      if (!status) { res.status(400).json({ erro: 'Status é obrigatório' }); return; }

      const imovel = await repo.buscarPorId(req.params.id);
      if (!imovel) { res.status(404).json({ erro: 'Imóvel não encontrado' }); return; }

      const novoHistorico: HistoricoItem = {
        status,
        descricao: descricao || `Status atualizado para ${status}`,
        usuarioId: req.usuario?.usuarioId,
        usuarioNome: req.usuario?.email,
        data: new Date(),
      };

      const atualizado = await repo.atualizar(req.params.id, {
        status,
        historico: [...(imovel.historico || []), novoHistorico],
      });
      res.json(atualizado);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async atribuirEngenheiro(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { engenheiroId } = req.body;
      const atualizado = await repo.atualizar(req.params.id, {
        engenheiroId,
        status: 'vistoria_agendada',
      });
      if (!atualizado) { res.status(404).json({ erro: 'Imóvel não encontrado' }); return; }
      res.json(atualizado);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async estatisticas(_req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const [todos, cadastrados, emAnalise, aprovados, matriculados] = await Promise.all([
        repo.listar({}, 1, 9999),
        repo.listar({ status: 'cadastrado' }, 1, 9999),
        repo.listar({ status: 'em_analise' }, 1, 9999),
        repo.listar({ status: 'aprovado' }, 1, 9999),
        repo.listar({ status: 'matriculado' }, 1, 9999),
      ]);
      res.json({
        total: todos.total,
        cadastrados: cadastrados.total,
        emAnalise: emAnalise.total,
        aprovados: aprovados.total,
        matriculados: matriculados.total,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}
