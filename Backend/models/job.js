import mongoose from "mongoose";

export const WORKPLACES = ["Onsite", "Hybrid", "Remote"];
export const JOB_TYPES = ["Intern", "Full Time", "Part Time"];
export const JOB_STATUSES = ["Open", "Closed", "Drafted"];

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recruiter is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    workplace: {
      type: String,
      enum: {
        values: WORKPLACES,
        message: "Workplace must be Onsite, Hybrid, or Remote",
      },
      required: [true, "Workplace is required"],
    },
    jobType: {
      type: String,
      enum: {
        values: JOB_TYPES,
        message: "Job type must be Intern, Full Time, or Part Time",
      },
      required: [true, "Job type is required"],
    },
    skills: {
      type: [String],
      required: [true, "Skills are required"],
      validate: {
        validator: (skills) => Array.isArray(skills) && skills.length > 0,
        message: "Skills must contain at least one skill",
      },
    },
    status: {
      type: String,
      enum: {
        values: JOB_STATUSES,
        message: "Status must be Open, Closed, or Drafted",
      },
      default: "Drafted",
    },
    requirements: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    applicationEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Job", jobSchema);
