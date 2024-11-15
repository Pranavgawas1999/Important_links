import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import savedLinkRoutes from './routes/savedLinkRoutes.js';
import imageLinkRoutes from './routes/imageLinkRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect('process.env.MONGODB_URI', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

app.use('/api/saved-links', savedLinkRoutes);
app.use('/api/image-links', imageLinkRoutes);

export default app;