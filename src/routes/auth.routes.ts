import { Router } from 'express';
import { refreshToken, signIn, signOut, signUp, verifyEmail } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post("/sign-out", signOut);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/verify-email', verifyEmail);

export default authRouter;