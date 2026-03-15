import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { conectarBancoDeDados } from './servicosTecnicos/database/mongo';
import rotas from './ui/rotas/index';
import { erroMiddleware } from './ui/middlewares/erroMiddleware';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Segurança & Logging ──
app.use(helmet());
app.use(morgan('dev'));

// ── CORS ──
const origensPermitidas = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origensPermitidas.includes(origin) || origensPermitidas.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origem: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health Check ──
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'RegularizaJá API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ── Rotas ──
app.use('/api', rotas);

// ── Erro 404 ──
app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// ── Middleware de Erros ──
app.use(erroMiddleware);

// ── Iniciar ──
async function iniciar() {
  try {
    await conectarBancoDeDados();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📋 Rotas disponíveis:`);
      console.log(`   POST /api/auth/registrar`);
      console.log(`   POST /api/auth/login`);
      console.log(`   GET  /api/documentos/publicos`);
      console.log(`   POST /api/solicitacoes`);
      console.log(`   GET  /api/solicitacoes/protocolo/:protocolo`);
      console.log(`   GET  /api/imoveis`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar:', err);
    process.exit(1);
  }
}

iniciar();
