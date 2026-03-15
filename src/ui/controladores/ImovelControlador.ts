import { Request, Response } from 'express';
import { ImovelRepositorio } from '@servicosTecnicos/repositorios/ImovelRepositorio';
import { UsuarioRepositorio } from '@servicosTecnicos/repositorios/UsuarioRepositorio';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';
import { HistoricoItem } from '@dominio/entidades/Imovel';

const repo = new ImovelRepositorio();
const usuarioRepo = new UsuarioRepositorio();

export class ImovelControlador {
  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { status, pagina = '1', limite = '20', responsavelId } = req.query as any;
      const filtros: any = {};
      if (status) filtros.status = status;
      if (responsavelId) filtros.engenheiroId = responsavelId;
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
        res.status(400).json({ erro: 'Nome, CPF e telefone são obrigatórios' });
        return;
      }
      const imovel = await repo.criar({
        ...dados,
        status: 'cadastrado',
        documentosSolicitados: dados.documentosSolicitados || [],
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

  // ── Repassar processo para outro usuário ──
  async repassar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { novoResponsavelId, motivo } = req.body;
      if (!novoResponsavelId) {
        res.status(400).json({ erro: 'ID do novo responsável é obrigatório' });
        return;
      }

      const imovel = await repo.buscarPorId(req.params.id);
      if (!imovel) { res.status(404).json({ erro: 'Imóvel não encontrado' }); return; }

      const novoResponsavel = await usuarioRepo.buscarPorId(novoResponsavelId);
      if (!novoResponsavel) {
        res.status(404).json({ erro: 'Usuário não encontrado' });
        return;
      }

      const novoHistorico: HistoricoItem = {
        status: imovel.status,
        descricao: `Processo repassado para ${novoResponsavel.nome}${motivo ? `. Motivo: ${motivo}` : ''}`,
        usuarioId: req.usuario?.usuarioId,
        usuarioNome: req.usuario?.email,
        data: new Date(),
      };

      const atualizado = await repo.atualizar(req.params.id, {
        engenheiroId: novoResponsavelId,
        historico: [...(imovel.historico || []), novoHistorico],
      });

      res.json({
        mensagem: `Processo repassado para ${novoResponsavel.nome}`,
        imovel: atualizado,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  // ── Solicitar documentos iniciais ──
  async solicitarDocumentos(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { documentos, mensagem } = req.body;
      if (!documentos || !Array.isArray(documentos) || documentos.length === 0) {
        res.status(400).json({ erro: 'Lista de documentos é obrigatória' });
        return;
      }

      const imovel = await repo.buscarPorId(req.params.id);
      if (!imovel) { res.status(404).json({ erro: 'Imóvel não encontrado' }); return; }

      const novoHistorico: HistoricoItem = {
        status: imovel.status,
        descricao: `Documentos solicitados: ${documentos.join(', ')}${mensagem ? `. ${mensagem}` : ''}`,
        usuarioId: req.usuario?.usuarioId,
        usuarioNome: req.usuario?.email,
        data: new Date(),
      };

      const atualizado = await repo.atualizar(req.params.id, {
        status: 'documentacao_pendente',
        historico: [...(imovel.historico || []), novoHistorico],
      });

      res.json({
        mensagem: 'Documentos solicitados com sucesso',
        imovel: atualizado,
        documentosSolicitados: documentos,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async atribuirEngenheiro(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { engenheiroId } = req.body;
      const imovel = await repo.buscarPorId(req.params.id);
      if (!imovel) { res.status(404).json({ erro: 'Imóvel não encontrado' }); return; }

      const engenheiro = await usuarioRepo.buscarPorId(engenheiroId);

      const novoHistorico: HistoricoItem = {
        status: 'vistoria_agendada',
        descricao: `Engenheiro ${engenheiro?.nome || engenheiroId} atribuído ao processo`,
        usuarioId: req.usuario?.usuarioId,
        usuarioNome: req.usuario?.email,
        data: new Date(),
      };

      const atualizado = await repo.atualizar(req.params.id, {
        engenheiroId,
        status: 'vistoria_agendada',
        historico: [...(imovel.historico || []), novoHistorico],
      });
      if (!atualizado) { res.status(404).json({ erro: 'Imóvel não encontrado' }); return; }
      res.json(atualizado);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  // ── Listar usuários disponíveis para repasse ──
  async listarResponsaveis(_req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const usuarios = await usuarioRepo.listar();
      const responsaveis = usuarios
        .filter(u => ['admin', 'engenheiro', 'assistente_social'].includes(u.role) && u.ativo)
        .map(u => ({ id: u.id, nome: u.nome, email: u.email, role: u.role }));
      res.json(responsaveis);
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async estatisticas(_req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const [todos, cadastrados, emAnalise, aprovados, matriculados, cartorio] = await Promise.all([
        repo.listar({}, 1, 9999),
        repo.listar({ status: 'cadastrado' }, 1, 9999),
        repo.listar({ status: 'em_analise' }, 1, 9999),
        repo.listar({ status: 'aprovado' }, 1, 9999),
        repo.listar({ status: 'matriculado' }, 1, 9999),
        repo.listar({ status: 'cartorio' }, 1, 9999),
      ]);
      res.json({
        total: todos.total,
        cadastrados: cadastrados.total,
        emAnalise: emAnalise.total,
        aprovados: aprovados.total,
        matriculados: matriculados.total,
        cartorio: cartorio.total,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}