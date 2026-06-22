import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

const passwordResetTokenSchema = new Schema({
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

passwordResetTokenSchema.pre("save", async function () {
  if (!this.isModified("token")) return;
  this.token = await bcrypt.hash(this.token, 10);
});

passwordResetTokenSchema.methods.compareToken = async function (rawToken) {
  return await bcrypt.compare(rawToken, this.token);
};

export default model("PasswordResetToken", passwordResetTokenSchema);