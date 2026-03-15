import { Request, Response } from 'express';
import { UsuarioRepositorio } from '@servicosTecnicos/repositorios/UsuarioRepositorio';
import { AutenticacaoServico } from '@servicosTecnicos/servicos/AutenticacaoServico';
import { RequestAutenticado } from '../middlewares/autenticacaoMiddleware';

const repo = new UsuarioRepositorio();
const autService = new AutenticacaoServico();

export class AutenticacaoControlador {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha, role } = req.body;
      if (!nome || !email || !senha) {
        res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
        return;
      }
      const existe = await repo.buscarPorEmail(email);
      if (existe) {
        res.status(409).json({ erro: 'E-mail já cadastrado' });
        return;
      }
      const senhaHash = await autService.hashSenha(senha);
      const usuario = await repo.criar({
        nome, email, senhaHash,
        role: role || 'usuario',
        ativo: true,
      });
      const token = autService.gerarToken({
        usuarioId: usuario.id!,
        email: usuario.email,
        role: usuario.role,
      });
      res.status(201).json({
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      });
    } catch (e: any) {
      res.status(400).json({ erro: e.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;
      if (!email || !senha) {
        res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
        return;
      }
      const usuario = await repo.buscarPorEmail(email);
      if (!usuario || !usuario.ativo) {
        res.status(401).json({ erro: 'Credenciais inválidas' });
        return;
      }
      const senhaValida = await autService.compararSenha(senha, usuario.senhaHash);
      if (!senhaValida) {
        res.status(401).json({ erro: 'Credenciais inválidas' });
        return;
      }
      const token = autService.gerarToken({
        usuarioId: usuario.id!,
        email: usuario.email,
        role: usuario.role,
      });
      res.json({
        token,
        usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
      });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }

  async perfil(req: RequestAutenticado, res: Response): Promise<void> {
    try {
      const usuario = await repo.buscarPorId(req.usuario!.usuarioId);
      if (!usuario) { res.status(404).json({ erro: 'Usuário não encontrado' }); return; }
      res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role });
    } catch (e: any) {
      res.status(500).json({ erro: e.message });
    }
  }
}
