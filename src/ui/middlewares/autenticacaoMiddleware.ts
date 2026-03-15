import { Request, Response, NextFunction } from 'express';
import { AutenticacaoServico } from '@servicosTecnicos/servicos/AutenticacaoServico';

export interface RequestAutenticado extends Request {
  usuario?: { usuarioId: string; email: string; role: string };
}

const autService = new AutenticacaoServico();

export function autenticar(req: RequestAutenticado, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ erro: 'Token não fornecido' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    req.usuario = autService.verificarToken(token);
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

export function autorizar(...roles: string[]) {
  return (req: RequestAutenticado, res: Response, next: NextFunction): void => {
    if (!req.usuario || !roles.includes(req.usuario.role)) {
      res.status(403).json({ erro: 'Acesso não autorizado' });
      return;
    }
    next();
  };
}
