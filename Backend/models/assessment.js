import mongoose from "mongoose";
import { ASSESSMENT_TYPES, ASSESSMENT_STATUSES, DIFFICULTY_LEVELS } from "../config/assessment.js";

const assessmentSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ASSESSMENT_TYPES,
      default: "NONE",
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    repositorySize: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: DIFFICULTY_LEVELS,
      default: "Auto",
    },
    topics: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ASSESSMENT_STATUSES,
      default: "Drafted",
    },
    durationMinutes: {
      type: Number,
      required: [true, "Assessment duration is required"],
      min: [5, "Duration must be at least 5 minutes"],
      max: [180, "Duration cannot exceed 180 minutes"],
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Assessment", assessmentSchema);
