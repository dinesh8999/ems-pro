import mongoose from 'mongoose';

const performanceReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewPeriod: {
    type: String,
    required: true
  },
  reviewDate: {
    type: Date,
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  ratings: {
    technicalSkills: { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    teamwork: { type: Number, min: 1, max: 5, required: true },
    problemSolving: { type: Number, min: 1, max: 5, required: true },
    productivity: { type: Number, min: 1, max: 5, required: true }
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  },
  strengths: String,
  areasOfImprovement: String,
  goals: [String],
  feedback: String,
  status: {
    type: String,
    enum: ['Draft', 'Completed', 'Acknowledged'],
    default: 'Draft'
  }
}, { timestamps: true });

performanceReviewSchema.pre('save', function(next) {
  if (this.ratings) {
    const { technicalSkills, communication, teamwork, problemSolving, productivity } = this.ratings;
    this.overallRating = ((technicalSkills + communication + teamwork + problemSolving + productivity) / 5).toFixed(2);
  }
  next();
});

export default mongoose.model('PerformanceReview', performanceReviewSchema);
