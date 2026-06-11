import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['employee', 'hr', 'company', 'superadmin'],
      required: true,
    },
    /** Links to workforce profile: emp001, hr001, co001, etc. */
    profileId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    profileId: this.profileId,
  };
};

export default mongoose.model('User', userSchema);
