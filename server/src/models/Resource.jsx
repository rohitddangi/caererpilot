import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['course', 'certification', 'youtube', 'documentation'], required: true },
  technology: String,
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  url: String,
  careerPath: String,
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
