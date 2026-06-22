import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";


const refreshTokenSchema = new Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Token must belong to a user"],
    },

    expiresAt: {
      type: Date,
      required: [true, "Token expiry date is required"],
    },
  },
  { timestamps: true }
);

refreshTokenSchema.pre("save", async function () {
  if (!this.isModified("token")) return;
  this.token = await bcrypt.hash(this.token, 11);
});

refreshTokenSchema.methods.compareToken = async function (rawToken) {
  return await bcrypt.compare(rawToken, this.token);
};

export default model("RefreshToken", refreshTokenSchema);
