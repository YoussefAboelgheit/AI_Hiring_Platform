import mongoose from "mongoose";
import { DIFFICULTY_LEVELS } from "../config/assessment.js";

const questionSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message: "Must have exactly 4 options",
      },
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS.filter((d) => d !== "Auto" && d !== "Mixed"),
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
