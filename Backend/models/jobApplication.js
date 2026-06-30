import mongoose from "mongoose";

export const JOB_DELETED_APPLICATION_STATUS = "Job has been deleted";

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate is required"],
    },
    CV: {
      type: String,
      required: [true, "CV is required"],
    },
    parsedResume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParsedResume",
      default: null,
    },
    jobSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    matchScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    matchingStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "skipped"],
      default: "pending",
    },
    matchingError: {
      type: String,
      default: "",
    },
    matchedAgainstJobVersion: {
      type: Number,
      default: null,
    },
    aiEvaluation: {
      strengths: {
        type: [String],
        default: [],
      },
      weaknesses: {
        type: [String],
        default: [],
      },
      summary: {
        type: String,
        default: "",
      },
      recommendation: {
        type: String,
        default: "",
      },
      generatedAt: {
        type: Date,
        default: null,
      },
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Reviewed", "Accepted", "Rejected", "Deleted", JOB_DELETED_APPLICATION_STATUS],
        message: "Status must be Pending, Reviewed, Accepted, Rejected, Deleted, or Job has been deleted",
      },
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

jobApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export default mongoose.model("JobApplication", jobApplicationSchema);
