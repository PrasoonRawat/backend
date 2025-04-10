import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctors', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  visitedFor: { type: String, required: true },
  recommended: { type: Boolean, required: true },
  story: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Stories', storySchema);
