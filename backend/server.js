import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import { savedFolderRouter } from './routes/savedFolders.js';
import { imageFolderRouter } from './routes/imageFolders.js';
import savedLinkRoutes from './routes/savedLinks.js';
import imageLinkRoutes from './routes/imageLinks.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "*", // Replace with your frontend URL once deployed
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));  

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/savedFolders', savedFolderRouter);
app.use('/imageFolders', imageFolderRouter);
app.use('/savedLinks', savedLinkRoutes);
app.use('/imageLinks', imageLinkRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong!';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry connection after 5 seconds
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Initialize database connection
connectDB();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;