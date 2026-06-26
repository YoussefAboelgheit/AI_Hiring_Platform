import mongoose from "mongoose";

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
    status: {
      type: String,
      enum: {
        values: ["Pending", "Reviewed", "Accepted", "Rejected"],
        message: "Status must be Pending, Reviewed, Accepted, or Rejected",
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
