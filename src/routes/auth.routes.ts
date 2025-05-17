import { Router } from 'express';
import { refreshToken, signIn, signOut, signUp, verifyAcsessToken, verifyEmail } from '../controllers/auth.controller';

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post("/sign-out", signOut);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/verify-acsess-token', verifyAcsessToken);

export default authRouter;