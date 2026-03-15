import { Router } from 'express';
import { SolicitacaoControlador } from '../controladores/SolicitacaoControlador';
import { autenticar, autorizar } from '../middlewares/autenticacaoMiddleware';

const router = Router();
const ctrl = new SolicitacaoControlador();

// ── PÚBLICAS ──
router.post('/', (req, res) => ctrl.criar(req, res));
router.get('/protocolo/:protocolo', (req, res) => ctrl.consultarProtocolo(req, res));

// ── PROTEGIDAS ──
router.use(autenticar);

router.get('/', (req, res) => ctrl.listar(req as any, res));
router.get('/:id', (req, res) => ctrl.buscarPorId(req as any, res));
router.put('/:id/status', (req, res) => ctrl.atualizarStatus(req as any, res));
router.post('/:id/converter', autorizar('admin'), (req, res) => ctrl.converterEmImovel(req as any, res));

export default router;
