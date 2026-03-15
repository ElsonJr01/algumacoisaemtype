import { Router } from 'express';
import { ImovelRepositorio } from '../../servicosTecnicos/repositorios/ImovelRepositorio';
import { autenticar, autorizar } from '../middlewares/autenticacaoMiddleware';
import { HistoricoItem } from '@dominio/entidades/Imovel';

const router = Router();
const repo = new ImovelRepositorio();

// ── Registrar encaminhamento ao cartório ──
router.post('/:imovelId/encaminhar', autenticar, autorizar('admin', 'engenheiro'), async (req: any, res) => {
  try {
    const { imovelId } = req.params;
    const {
      nomeCartorio,
      enderecoCartorio,
      responsavel,
      dataEncaminhamento,
      documentos,
      observacoes,
    } = req.body;

    if (!nomeCartorio) {
      res.status(400).json({ erro: 'Nome do cartório é obrigatório' });
      return;
    }

    const imovel = await repo.buscarPorId(imovelId);
    if (!imovel) {
      res.status(404).json({ erro: 'Imóvel não encontrado' });
      return;
    }

    const novoHistorico: HistoricoItem = {
      status: 'cartorio',
      descricao: `Documentação encaminhada ao ${nomeCartorio}${responsavel ? ` — Responsável: ${responsavel}` : ''}${observacoes ? `. ${observacoes}` : ''}`,
      usuarioId: req.usuario?.usuarioId,
      usuarioNome: req.usuario?.email,
      data: new Date(),
    };

    const atualizado = await repo.atualizar(imovelId, {
      status: 'cartorio',
      historico: [...(imovel.historico || []), novoHistorico],
    });

    res.json({
      mensagem: 'Encaminhamento ao cartório registrado com sucesso',
      imovel: atualizado,
      detalhes: {
        nomeCartorio,
        enderecoCartorio,
        responsavel,
        dataEncaminhamento: dataEncaminhamento || new Date().toISOString(),
        documentos: documentos || [],
        observacoes,
      },
    });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

// ── Registrar deferimento/matrícula ──
router.post('/:imovelId/matricula', autenticar, autorizar('admin', 'engenheiro'), async (req: any, res) => {
  try {
    const { imovelId } = req.params;
    const { numeroMatricula, dataRegistro, cartorio, observacoes } = req.body;

    if (!numeroMatricula) {
      res.status(400).json({ erro: 'Número da matrícula é obrigatório' });
      return;
    }

    const imovel = await repo.buscarPorId(imovelId);
    if (!imovel) {
      res.status(404).json({ erro: 'Imóvel não encontrado' });
      return;
    }

    const novoHistorico: HistoricoItem = {
      status: 'matriculado',
      descricao: `Imóvel matriculado com sucesso! Matrícula nº ${numeroMatricula}${cartorio ? ` — ${cartorio}` : ''}${observacoes ? `. ${observacoes}` : ''}`,
      usuarioId: req.usuario?.usuarioId,
      usuarioNome: req.usuario?.email,
      data: new Date(),
    };

    const atualizado = await repo.atualizar(imovelId, {
      status: 'matriculado',
      historico: [...(imovel.historico || []), novoHistorico],
    });

    res.json({
      mensagem: '🎉 Imóvel matriculado com sucesso!',
      imovel: atualizado,
      matricula: {
        numero: numeroMatricula,
        dataRegistro: dataRegistro || new Date().toISOString(),
        cartorio,
      },
    });
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

// ── Listar imóveis no cartório ──
router.get('/pendentes', autenticar, async (_req, res) => {
  try {
    const resultado = await repo.listar({ status: 'cartorio' }, 1, 50);
    res.json(resultado);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

export default router;