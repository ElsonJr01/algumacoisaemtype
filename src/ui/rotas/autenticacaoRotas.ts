import { Router } from 'express';
import { AutenticacaoControlador } from '../controladores/AutenticacaoControlador';
import { autenticar } from '../middlewares/autenticacaoMiddleware';

const router = Router();
const ctrl = new AutenticacaoControlador();

router.post('/registrar', (req, res) => ctrl.registrar(req, res));
router.post('/login', (req, res) => ctrl.login(req, res));
router.get('/perfil', autenticar, (req, res) => ctrl.perfil(req as any, res));

export default router;
