import { Schema, model, Types } from 'mongoose';
import { TypeUser } from '@/types/userType';

export enum Role {
  Admin = 'Admin',
  Customer = 'Customer',
  Seller = 'Seller',
  Visitor = 'Visitor',
}

const userSchema = new Schema<TypeUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters long.'],
      maxlength: [50, 'First name must not exceed 50 characters.'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name must not exceed 50 characters.'],
      default: '',
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long.'],
      maxlength: [30, 'Username must not exceed 30 characters.'],
      match: [
        /^[a-zA-Z0-9._-]+$/,
        'Username can only contain letters, numbers, dots, underscores and hyphens.',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      unique: true,
      minlength: [3, 'Phone must be at least 3 characters long.'],
      maxlength: [20, 'Phone must not exceed 20 characters.'],
      match: [/^\+?[0-9]{10,15}$/, 'Phone number must be valid.'],
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationToken: {
      type: String,
      select: false,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email must be valid.'],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters long.'],
      select: false,
    },
    provider: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      google: { type: String, trim: true },
    },
    uploads: [
      {
        type: Types.ObjectId,
        ref: 'Upload',
      },
    ], // kl smjhana he
    role: {
      type: String, // 👈 force cast
      enum: Object.values(Role),
      default: Role.Customer,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    virtuals: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ phone: 1 });

// Pre-save hook for hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const bcrypt = await import('bcryptjs');
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<TypeUser>('User', userSchema);
