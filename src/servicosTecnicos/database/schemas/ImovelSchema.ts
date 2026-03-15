import mongoose, { Schema, Document } from 'mongoose';
import { Imovel } from '@dominio/entidades/Imovel';

export interface ImovelDocument extends Omit<Imovel, 'id'>, Document {}

const EnderecoSchema = new Schema({
  cep: String,
  logradouro: String,
  numero: String,
  complemento: String,
  bairro: String,
  cidade: String,
  estado: String,
}, { _id: false });

const HistoricoSchema = new Schema({
  status: String,
  descricao: String,
  usuarioId: String,
  usuarioNome: String,
  data: { type: Date, default: Date.now },
}, { _id: false });

const ImovelSchema = new Schema<ImovelDocument>(
  {
    protocolo: { type: String, unique: true, sparse: true },
    proprietarioId: { type: String },
    proprietarioNome: { type: String, required: true },
    proprietarioCpf: { type: String, required: true },
    proprietarioTelefone: { type: String, required: true },
    proprietarioEmail: { type: String },
    tipo: {
      type: String,
      enum: ['casa', 'apartamento', 'lote', 'comercial', 'outro'],
      default: 'casa',
    },
    endereco: EnderecoSchema,
    areaM2: { type: Number },
    situacaoDocumental: { type: String },
    temDocumento: { type: String },
    observacoes: { type: String },
    status: {
      type: String,
      enum: [
        'cadastrado', 'em_analise', 'vistoria_agendada',
        'documentacao_pendente', 'em_aprovacao', 'aprovado',
        'cartorio', 'matriculado', 'cancelado',
      ],
      default: 'cadastrado',
    },
    engenheiroId: { type: String },
    assistenteSocialId: { type: String },
    documentos: [{ type: String }],
    historico: [HistoricoSchema],
  },
  { timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' } }
);

ImovelSchema.pre('save', async function () {
  if (!this.protocolo) {
    this.protocolo = `RJ-${Date.now().toString().slice(-8)}`;
  }
});

export const ImovelModel = mongoose.model<ImovelDocument>('Imovel', ImovelSchema);
