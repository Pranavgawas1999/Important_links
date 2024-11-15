import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();  // This line loads the environment variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));


// Define a Link schema and model
const linkSchema = new mongoose.Schema({ url: String });
const Link = mongoose.model('Link', linkSchema);

// Routes
app.post('/api/links', async (req, res) => {
  const { url } = req.body;
  const newLink = new Link({ url });
  await newLink.save();
  res.status(201).json(newLink);
});

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.get('/api/links', async (req, res) => {
  const links = await Link.find();
  res.json(links);
});

app.delete('/api/links/:id', async (req, res) => {
  await Link.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
