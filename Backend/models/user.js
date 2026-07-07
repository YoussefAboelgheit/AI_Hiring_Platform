import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Please provide a valid email address",
      },
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },

    role: {
      type: String,
      enum: {
        values: ["candidate", "hr", "admin"],
        message: "Role must be candidate, hr, or admin",
      },
      default: "candidate",
    },

    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    company_logo: {
      type: String,
      default: "",
    },

    profile_image: {
      type: String,
      default: "",
    },

    CV: {
      type: String,
      default: "",
    },

    parsedResumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParsedResume",
      default: null,
    },

    // ── Candidate-specific fields ─────────────────────────────────────────────

    job_title: {
      type: String,
      maxlength: [100, "Job title cannot exceed 100 characters"],
      default: "",
    },

    about: {
      type: String,
      maxlength: [1000, "About cannot exceed 1000 characters"],
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    education: {
      type: [
        {
          degree:     { type: String, required: true },
          field:      { type: String, required: true },
          university: { type: String, required: true },
          from:       { type: Number, required: true },
          to:         { type: Number },
          current:    { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    attachments: {
      type: [String],
      default: [],
    },

    cv_visibility: {
      type: String,
      enum: {
        values: ["public", "private"],
        message: "CV visibility must be public or private",
      },
      default: "public",
    },

    // ── HR/Company-specific fields ────────────────────────────────────────────

    company_name: {
      type: String,
      maxlength: [100, "Company name cannot exceed 100 characters"],
      default: "",
    },

    company_website: {
      type: String,
      default: "",
    },

    company_size: {
      type: String,
      enum: {
        values: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+", ""],
        message: "Invalid company size",
      },
      default: "",
    },

    industry: {
      type: String,
      maxlength: [100, "Industry cannot exceed 100 characters"],
      default: "",
    },

    company_location: {
      type: String,
      maxlength: [100, "Company location cannot exceed 100 characters"],
      default: "",
    },

    company_description: {
      type: String,
      maxlength: [1000, "Company description cannot exceed 1000 characters"],
      default: "",
    },

    founded_year: {
      type: Number,
      default: null,
    },

    social_links: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getProfileCompletion = function () {
  if (this.role === "candidate") {
    const fields = [
      { key: "profile_image", weight: 15 },
      { key: "CV",            weight: 20 },
      { key: "job_title",     weight: 15 },
      { key: "about",         weight: 15 },
      { key: "skills",        weight: 15 },
      { key: "education",     weight: 10 },
      { key: "attachments",   weight: 10 },
    ];

    let total = 0;
    for (const field of fields) {
      const value  = this[field.key];
      const filled = Array.isArray(value) ? value.length > 0 : Boolean(value);
      if (filled) total += field.weight;
    }
    return total;
  }

  if (this.role === "hr") {
    const fields = [
      { key: "company_logo",        weight: 15 },
      { key: "company_name",        weight: 20 },
      { key: "company_website",     weight: 10 },
      { key: "company_size",        weight: 10 },
      { key: "industry",            weight: 10 },
      { key: "company_location",    weight: 10 },
      { key: "company_description", weight: 15 },
      { key: "social_links",        weight: 10 },
    ];

    let total = 0;
    for (const field of fields) {
      const value  = this[field.key];
      const filled = Array.isArray(value) ? value.length > 0 : Boolean(value);
      if (filled) total += field.weight;
    }
    return total;
  }

  return null;
};

export default mongoose.model("User", userSchema);