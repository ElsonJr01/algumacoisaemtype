import { Router } from 'express';
import autenticacaoRotas from './autenticacaoRotas';
import documentoRotas from './documentoRotas';
import imovelRotas from './imovelRotas';
import solicitacaoRotas from './solicitacaoRotas';

const router = Router();

router.use('/auth', autenticacaoRotas);
router.use('/documentos', documentoRotas);
router.use('/imoveis', imovelRotas);
router.use('/solicitacoes', solicitacaoRotas);

export default router;
