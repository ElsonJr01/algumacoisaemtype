import { Router, Request, Response } from 'express';
import { DocumentoControlador } from '../controladores/DocumentoControlador';
import { autenticar, autorizar } from '../middlewares/autenticacaoMiddleware';
import { upload } from '@servicosTecnicos/uploads/multerConfig';

const router = Router();
const ctrl = new DocumentoControlador();

// ── PÚBLICAS ──
router.get('/publicos', (req, res) => ctrl.listarPublicos(req, res));
router.get('/publicos/:id', (req, res) => ctrl.buscarPublicoPorId(req, res));
router.get('/publicos/:id/download', (req, res) => ctrl.download(req, res));

// ── PROTEGIDAS ──
router.use(autenticar);

router.get('/', (req, res) => ctrl.listar(req as any, res));
router.post('/', upload.single('arquivo'), (req, res) => ctrl.criar(req as any, res));
router.put('/:id', (req, res) => ctrl.atualizar(req as any, res));
router.delete('/:id', autorizar('admin'), (req, res) => ctrl.deletar(req as any, res));

export default router;
