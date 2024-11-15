import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Import Routes
import savedLinkRoutes from './routes/savedLinkRoutes.js';
import imageLinkRoutes from './routes/imageLinkRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('process.env.MONGO_URI', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/saved-links', savedLinkRoutes); // Route for saved links
app.use('/api/image-links', imageLinkRoutes); // Route for image links

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
