import mongoose from "mongoose";

const parsedResumeSchema = new mongoose.Schema(
  {
    originalFileName: {
      type: String,
      required: [true, "Original file name is required"],
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
      enum: ["upload", "user-cv"],
      default: "upload",
    },
    parsedData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Parsed resume data is required"],
    },
    isValid: {
      type: Boolean,
      default: true,
    },
    validationErrors: {
      type: [String],
      default: [],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("ParsedResume", parsedResumeSchema);
