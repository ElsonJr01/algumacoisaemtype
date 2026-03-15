import { Request, Response, NextFunction } from 'express';

export function erroMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ Erro:', err.message);

  if (err.name === 'ValidationError') {
    res.status(400).json({ erro: err.message });
    return;
  }
  if (err.code === 11000) {
    res.status(409).json({ erro: 'Registro duplicado' });
    return;
  }
  if (err.name === 'CastError') {
    res.status(400).json({ erro: 'ID inválido' });
    return;
  }

  res.status(err.status || 500).json({
    erro: err.message || 'Erro interno do servidor',
  });
}
