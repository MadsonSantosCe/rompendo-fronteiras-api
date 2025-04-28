import express from 'express';
import { PORT } from './config/env';

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.send({message : 'API is working!'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
