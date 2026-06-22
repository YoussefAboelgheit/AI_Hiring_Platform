import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const emailVerificationTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

emailVerificationTokenSchema.pre("save", async function () {
  if (!this.isModified("token")) return;
  this.token = await bcrypt.hash(this.token, 10);
});

emailVerificationTokenSchema.methods.compareToken = async function (rawToken) {
  return await bcrypt.compare(rawToken, this.token);
};

export default model("EmailVerificationToken", emailVerificationTokenSchema);