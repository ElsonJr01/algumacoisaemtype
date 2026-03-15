import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AutenticacaoServico {
  gerarToken(payload: { usuarioId: string; email: string; role: string }): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');
    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as any);
  }

  verificarToken(token: string): { usuarioId: string; email: string; role: string } {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');
    return jwt.verify(token, secret) as any;
  }

  async hashSenha(senha: string): Promise<string> {
    return bcrypt.hash(senha, 12);
  }

  async compararSenha(senha: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senha, hash);
  }
}
