import express from 'express';
import { connectDB } from './config/db';
import masterRouter from './routes/api/index';
import { config } from './config/config';
import cors from 'cors';

const app = express();

connectDB();

app.use(express.json());

app.use(cors({ origin: '*' }));

app.get('/', (req, res) => res.send('API Running'));

app.use('/api', masterRouter);

const PORT = config.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
