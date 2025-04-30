import { Router } from 'express';
import { signIn, signUp } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/sing-up', signUp);
authRouter.post('/sing-in', signIn);
authRouter.post('/sing-out', (req, res) => { res.send({ title: 'Sing out' }); });

export default authRouter;