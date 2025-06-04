import { Router } from 'express';
import { signIn, signOut, signUp, userInfo, refreshToken, verifyEmail, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { authorize } from '../middlewares/auth.middleware';

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post("/sign-out", signOut);
authRouter.post('/verify-acsess-token', authorize, userInfo);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/verify-email', verifyEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password/:token', resetPassword);


export default authRouter;