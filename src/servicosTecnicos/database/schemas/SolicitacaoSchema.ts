import mongoose, { Schema, Document } from 'mongoose';
import { Solicitacao } from '@dominio/entidades/Solicitacao';

export interface SolicitacaoDocument extends Omit<Solicitacao, 'id'>, Document {}

const SolicitacaoSchema = new Schema<SolicitacaoDocument>(
  {
    protocolo: { type: String, unique: true, sparse: true },
    nome: { type: String, required: true },
    cpf: { type: String, required: true },
    telefone: { type: String, required: true },
    email: { type: String },
    cep: { type: String },
    endereco: { type: String },
    numero: { type: String },
    bairro: { type: String },
    cidade: { type: String },
    estado: { type: String },
    areaM2: { type: Number },
    tipoImovel: { type: String },
    temDocumento: { type: String },
    situacao: { type: String },
    observacoes: { type: String },
    status: {
      type: String,
      enum: ['nova', 'em_analise', 'aprovada', 'rejeitada', 'convertida'],
      default: 'nova',
    },
    imovelId: { type: String },
    responsavelId: { type: String },
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } }
);

SolicitacaoSchema.pre('save', function () {
  if (!this.protocolo) {
    this.protocolo = `SOL-${Date.now().toString().slice(-8)}`;
  }
});

export const SolicitacaoModel = mongoose.model<SolicitacaoDocument>('Solicitacao', SolicitacaoSchema);
