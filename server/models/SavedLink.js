import mongoose from 'mongoose';

const savedLinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
});

const SavedLink = mongoose.model('SavedLink', savedLinkSchema);

export default SavedLink;
