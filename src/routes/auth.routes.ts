import { Router } from 'express';
import { signUp } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/sing-up', signUp);
authRouter.post('/sing-in', (req, res) => { res.send({ title: 'Sing in' }); });
authRouter.post('/sing-out', (req, res) => { res.send({ title: 'Sing out' }); });

export default authRouter;
