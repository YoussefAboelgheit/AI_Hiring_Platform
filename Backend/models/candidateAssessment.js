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
    completionReason: {
      type: String,
      enum: ["submitted", "expired", "auto_submitted", null],
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "auto_submitted"],
      default: "pending",
    },
    violationCount: {
      type: Number,
      default: 0,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    terminationReason: {
      type: String,
      enum: ["EXCEEDED_ALLOWED_VIOLATIONS", null],
      default: null,
    },
  },
  { timestamps: true }
);

candidateAssessmentSchema.index({ candidate: 1, job: 1 }, { unique: true });

export default mongoose.model("CandidateAssessment", candidateAssessmentSchema);
