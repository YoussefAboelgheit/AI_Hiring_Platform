import mongoose from "mongoose";

export const VIOLATION_TYPES = [
  "TAB_SWITCH",
  "FULLSCREEN_EXIT",
  "COPY",
  "PASTE",
  "CUT",
  "RIGHT_CLICK",
  "DRAG_START",
  "DEVTOOLS_SHORTCUT",
];

const assessmentViolationSchema = new mongoose.Schema(
  {
    attempt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateAssessment",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
    },
    type: {
      type: String,
      enum: VIOLATION_TYPES,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

assessmentViolationSchema.index({ attempt: 1 });
assessmentViolationSchema.index({ candidate: 1, assessment: 1 });

export default mongoose.model("AssessmentViolation", assessmentViolationSchema);
