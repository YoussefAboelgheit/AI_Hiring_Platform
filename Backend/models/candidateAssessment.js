import mongoose from "mongoose";

const candidateAssessmentSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    selectedQuestionIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    }],
    score: {
      type: Number,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

candidateAssessmentSchema.index({ candidate: 1, job: 1 }, { unique: true });

export default mongoose.model("CandidateAssessment", candidateAssessmentSchema);
