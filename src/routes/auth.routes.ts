import { Router } from 'express';
import { signIn, signUp } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/sing-up', signUp);
authRouter.post('/sing-in', signIn);

export default authRouter;