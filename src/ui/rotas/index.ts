import { Router } from 'express';
import autenticacaoRotas from './autenticacaoRotas';
import documentoRotas from './documentoRotas';
import imovelRotas from './imovelRotas';
import solicitacaoRotas from './solicitacaoRotas';
import usuarioRotas from './usuarioRotas';
import cartorioRotas from './cartorioRotas';

const router = Router();

router.use('/auth', autenticacaoRotas);
router.use('/usuarios', usuarioRotas);
router.use('/documentos', documentoRotas);
router.use('/imoveis', imovelRotas);
router.use('/solicitacoes', solicitacaoRotas);
router.use('/cartorio', cartorioRotas);

export default router;