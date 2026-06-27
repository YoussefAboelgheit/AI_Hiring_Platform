import mongoose from "mongoose";

const parsedJobSchema = new mongoose.Schema(
  {
    originalSource: {
      type: String,
      required: [true, "Original source is required"],
    },
    contentType: {
      type: String,
      required: [true, "Content type is required"],
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
    source: {
      type: String,
      enum: ["upload", "job-posting"],
      default: "upload",
    },
    parsedData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Parsed job data is required"],
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    validationErrors: {
      type: [String],
      default: [],
    },
    embeddingRefs: {
      type: [String],
      default: [],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ParsedJob", parsedJobSchema);
