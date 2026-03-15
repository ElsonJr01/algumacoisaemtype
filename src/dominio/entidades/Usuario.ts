export type RoleUsuario = 'admin' | 'engenheiro' | 'assistente_social' | 'usuario';

export interface Usuario {
  id?: string;
  nome: string;
  email: string;
  senhaHash: string;
  role: RoleUsuario;
  ativo: boolean;
  criadoEm?: Date;
  atualizadoEm?: Date;
}
