import express from 'express';
import { PORT } from './config/env';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';

const app = express();
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.get('/', (_req, res) => {
  res.send({message : 'API is working!'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
