import { Request, Response } from 'express';
import { SolicitacaoRepositorio } from '@servicosTecnicos/repositorios/SolicitacaoRepositorio';
import { ImovelRepositorio } from '@servicosTecnicos/repositorios/ImovelRepositorio';
import { EmailServico } from '@servicosTecnicos/servicos/EmailServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const repo = new SolicitacaoRepositorio();
const imovelRepo = new ImovelRepositorio();
const emailServico = new EmailServico();

export class SolicitacaoControlador {
  // ── PÚBLICO — Criar nova solicitação ──
  async criar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, cpf, telefone, email, cep, endereco, numero, bairro,
        cidade, estado, areaM2, tipoImovel, temDocumento, situacao, observacoes } = req.body;

      if (!nome || !cpf || !telefone) {
        res.status(400).json({ erro: 'Nome, CPF e telefone são obrigatórios' });
        return;
      }

      const solicitacao = await repo.criar({
        nome, cpf, telefone, email, cep, endereco, numero,
        bairro, cidade, estado, areaM2, tipoImovel,
        temDocumento, situacao, observacoes,
        status: 'nova',
      });

      // Envia email de confirmação se tiver email
      if (email && solicitacao.protocolo) {
        emailServico.enviarConfirmacaoSolicitacao({
          nome, email, protocolo: solicitacao.protocolo,
        }).catch(console.error);
      }

      res.status(201).json({
        mensagem: 'Solicitação recebida com sucesso!',
        protocolo: solicitacao.protocolo,
        id: solicitacao.id,
      });
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  // ── PÚBLICO — Consultar por protocolo ──
  async consultarProtocolo(req: Request, res: Response): Promise<void> {
    try {
      const sol = await repo.buscarPorProtocolo(req.params.protocolo);
      if (!sol) { res.status(404).json({ erro: 'Protocolo não encontrado' }); return; }
      res.json({
        protocolo: sol.protocolo,
        status: sol.status,
        nome: sol.nome,
        cidade: sol.cidade,
        criadoEm: sol.criadoEm,
      });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  // ── ADMIN ──
  async listar(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { status, pagina = '1', limite = '20' } = req.query as any;
      const resultado = await repo.listar(
        status ? { status } : {},
        parseInt(pagina),
        parseInt(limite)
      );
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
      const sol = await repo.buscarPorId(req.params.id);
      if (!sol) { res.status(404).json({ erro: 'Solicitação não encontrada' }); return; }
      res.json(sol);
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async atualizarStatus(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const { status, responsavelId } = req.body;
      const sol = await repo.atualizar(req.params.id, {
        status,
        responsavelId: responsavelId || req.usuario?.usuarioId,
      });
      if (!sol) { res.status(404).json({ erro: 'Solicitação não encontrada' }); return; }
      res.json(sol);
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  // Converte solicitação em imóvel no sistema
  async converterEmImovel(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const sol = await repo.buscarPorId(req.params.id);
      if (!sol) { res.status(404).json({ erro: 'Solicitação não encontrada' }); return; }

      const imovel = await imovelRepo.criar({
        proprietarioNome: sol.nome,
        proprietarioCpf: sol.cpf,
        proprietarioTelefone: sol.telefone,
        proprietarioEmail: sol.email,
        tipo: (sol.tipoImovel as any) || 'casa',
        endereco: {
          cep: sol.cep,
          logradouro: sol.endereco,
          numero: sol.numero,
          bairro: sol.bairro,
          cidade: sol.cidade,
          estado: sol.estado,
        },
        areaM2: sol.areaM2,
        situacaoDocumental: sol.situacao,
        temDocumento: sol.temDocumento,
        observacoes: sol.observacoes,
        status: 'cadastrado',
        historico: [{
          status: 'cadastrado',
          descricao: `Convertido da solicitação ${sol.protocolo}`,
          usuarioId: req.usuario?.usuarioId,
          usuarioNome: req.usuario?.email,
          data: new Date(),
        }],
      });

      await repo.atualizar(req.params.id, {
        status: 'convertida',
        imovelId: imovel.id,
      });

      res.status(201).json({ mensagem: 'Convertida com sucesso', imovel });
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }
}
