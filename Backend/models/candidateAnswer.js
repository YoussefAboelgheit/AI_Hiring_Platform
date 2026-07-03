import mongoose from "mongoose";

const candidateAnswerSchema = new mongoose.Schema(
  {
    candidateAssessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateAssessment",
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CandidateAnswer", candidateAnswerSchema);
