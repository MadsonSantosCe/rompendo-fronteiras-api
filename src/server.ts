import express from 'express';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import cors from 'cors';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
