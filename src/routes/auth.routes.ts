import { Router } from 'express';
import { refreshToken, signIn, signOut, signUp, getProfile, verifyEmail } from '../controllers/auth.controller';
import { authorize } from '../middlewares/auth.middleware';

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post("/sign-out", signOut);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/verify-acsess-token', authorize, getProfile);

export default authRouter;