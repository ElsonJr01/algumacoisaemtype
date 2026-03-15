import mongoose, { Schema, Document } from 'mongoose';
import { Usuario } from '@dominio/entidades/Usuario';

export interface UsuarioDocument extends Omit<Usuario, 'id'>, Document {}

const UsuarioSchema = new Schema<UsuarioDocument>(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    senhaHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'engenheiro', 'assistente_social', 'usuario'],
      default: 'usuario',
    },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } }
);

export const UsuarioModel = mongoose.model<UsuarioDocument>('Usuario', UsuarioSchema);
