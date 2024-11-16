import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Link from './models/Link.js'; // Add `.js` extension for ES modules

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.post('/links', async (req, res) => {
    try {
        const link = new Link(req.body);
        await link.save();
        res.status(201).json(link);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/links', async (req, res) => {
    try {
        const links = await Link.find();
        res.json(links);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Link.findByIdAndDelete(id);
        res.json({ message: 'Link deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
