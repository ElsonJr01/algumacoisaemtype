import { Router } from 'express';
import { ImovelControlador } from '../controladores/ImovelControlador';
import { autenticar, autorizar } from '../middlewares/autenticacaoMiddleware';

const router = Router();
const ctrl = new ImovelControlador();

// ── PÚBLICA — consulta por protocolo ──
router.get('/protocolo/:protocolo', (req, res) => ctrl.buscarPorProtocolo(req, res));

// ── PROTEGIDAS ──
router.use(autenticar);

router.get('/estatisticas', (req, res) => ctrl.estatisticas(req as any, res));
router.get('/', (req, res) => ctrl.listar(req as any, res));
router.get('/:id', (req, res) => ctrl.buscarPorId(req as any, res));
router.post('/', autorizar('admin', 'engenheiro'), (req, res) => ctrl.criar(req as any, res));
router.put('/:id/status', (req, res) => ctrl.atualizarStatus(req as any, res));
router.put('/:id/engenheiro', autorizar('admin'), (req, res) => ctrl.atribuirEngenheiro(req as any, res));

export default router;
