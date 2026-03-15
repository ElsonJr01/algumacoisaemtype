import mongoose, { Schema, Document as MongoDocument } from 'mongoose';
import { Documento } from '@dominio/entidades/Documento';

export interface DocumentoDocument extends Omit<Documento, 'id'>, MongoDocument {}

const DocumentoSchema = new Schema<DocumentoDocument>(
  {
    titulo: { type: String, required: true, trim: true },
    categoria: {
      type: String,
      enum: [
        'ata', 'balancete', 'relatorio', 'estatuto', 'contrato',
        'planta', 'matricula', 'escritura', 'iptu',
        'identidade', 'cpf', 'comprovante_residencia', 'outros',
      ],
      default: 'outros',
    },
    nota: { type: String },
    data: { type: String },
    nomeArquivo: { type: String },
    tipoArquivo: { type: String },
    tamanhoArquivo: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'arquivado'],
      default: 'ativo',
    },
    visibilidade: {
      type: String,
      enum: ['publico', 'privado'],
      default: 'privado',
    },
    urlPublica: { type: String },
    publicId: { type: String },
    imovelId: { type: String },
    criadoPorId: { type: String },
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } }
);

export const DocumentoModel = mongoose.model<DocumentoDocument>('Documento', DocumentoSchema);
