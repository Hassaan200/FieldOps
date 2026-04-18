import express from 'express';
import cors from 'cors';
import 'dotenv/config'; 
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.json({ message: 'FieldOps API running' }));

const PORT = process.env.PORT || 5000;
// backend server is ruuning on computer's IP not on local host.
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
