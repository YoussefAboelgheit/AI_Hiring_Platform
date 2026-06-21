import { Schema, model } from "mongoose";

const blacklistedTokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// auto delete expired tokens from DB
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("BlacklistedToken", blacklistedTokenSchema);