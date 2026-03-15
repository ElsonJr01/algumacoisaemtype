import { Router } from 'express';
import { UsuarioRepositorio } from '../../servicosTecnicos/repositorios/UsuarioRepositorio';
import { AutenticacaoServico } from '../../servicosTecnicos/servicos/AutenticacaoServico';
import { autenticar, autorizar } from '../middlewares/autenticacaoMiddleware';

const router = Router();
const repo = new UsuarioRepositorio();
const autService = new AutenticacaoServico();

// ── ADMIN: listar todos os usuários ──
router.get('/', autenticar, autorizar('admin'), async (_req, res) => {
  try {
    const usuarios = await repo.listar();
    res.json(usuarios.map(u => ({
      id: u.id, nome: u.nome, email: u.email, role: u.role, ativo: u.ativo, criadoEm: u.criadoEm,
    })));
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
});

// ── ADMIN: criar novo usuário com perfil ──
router.post('/', autenticar, autorizar('admin'), async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;
    if (!nome || !email || !senha || !role) {
      res.status(400).json({ erro: 'Nome, email, senha e perfil são obrigatórios' });
      return;
    }
    const roles = ['admin', 'engenheiro', 'assistente_social', 'usuario'];
    if (!roles.includes(role)) {
      res.status(400).json({ erro: 'Perfil inválido' });
      return;
    }
    const existe = await repo.buscarPorEmail(email);
    if (existe) {
      res.status(409).json({ erro: 'E-mail já cadastrado' });
      return;
    }
    const senhaHash = await autService.hashSenha(senha);
    const usuario = await repo.criar({ nome, email, senhaHash, role, ativo: true });
    res.status(201).json({
      id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role,
    });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

// ── ADMIN: atualizar perfil/status de usuário ──
router.put('/:id', autenticar, autorizar('admin'), async (req, res) => {
  try {
    const { nome, role, ativo } = req.body;
    const usuario = await repo.atualizar(req.params.id, { nome, role, ativo });
    if (!usuario) {
      res.status(404).json({ erro: 'Usuário não encontrado' });
      return;
    }
    res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role, ativo: usuario.ativo });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

// ── ADMIN: desativar usuário ──
router.delete('/:id', autenticar, autorizar('admin'), async (req, res) => {
  try {
    await repo.atualizar(req.params.id, { ativo: false });
    res.json({ mensagem: 'Usuário desativado com sucesso' });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

// ── Trocar própria senha ──
router.put('/minha-senha', autenticar, async (req: any, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) {
      res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' });
      return;
    }
    const usuario = await repo.buscarPorId(req.usuario.usuarioId);
    if (!usuario) { res.status(404).json({ erro: 'Usuário não encontrado' }); return; }
    const valida = await autService.compararSenha(senhaAtual, usuario.senhaHash);
    if (!valida) { res.status(401).json({ erro: 'Senha atual incorreta' }); return; }
    const senhaHash = await autService.hashSenha(novaSenha);
    await repo.atualizar(req.usuario.usuarioId, { senhaHash });
    res.json({ mensagem: 'Senha atualizada com sucesso' });
  } catch (e: any) {
    res.status(400).json({ erro: e.message });
  }
});

export default router;