import { Schema, model, Types, models } from 'mongoose';
import { IUserDocument, IUserModel } from '@/types/userType';

export enum Role {
  Admin = 'Admin',
  Customer = 'Customer',
  Seller = 'Seller',
  Visitor = 'Visitor',
}

const userSchema = new Schema<IUserDocument, IUserModel>(
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
      unique: [true, 'Username is already exists.'],
      index: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must be at least 3 characters long.'],
      maxlength: [30, 'Username must not exceed 30 characters.'],
      // validate: function (err) {
      //   console.error(String(err)); // "ValidationError: Path `name` is invalid (I am invalid)."
      //   this.username = 'apples';
      //   this.validate(function (err) {
      //     assert.ok(err); // success
      //   });
      // },
      match: [
        /^[a-zA-Z0-9._-]+$/,
        'Username can only contain letters, numbers, dots, underscores and hyphens.',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required.'],
      unique: [true, 'Phone number is already exists.'],
      minlength: [3, 'Phone must be at least 3 characters long.'],
      maxlength: [20, 'Phone must not exceed 20 characters.'],
      match: [/^\+?[0-9]{10,15}$/, 'Phone number must be valid.'],
      index: true,
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
      unique: [true, 'Email is already exists.'],
      index: true,
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
    refreshToken: {
      type: String,
      select: false,
    },
    provider: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      google: { type: String, trim: true },
      default: { type: String, trim: true },
    },
    uploads: [
      {
        type: Types.ObjectId,
        ref: 'Upload',
      },
    ],
    role: {
      type: String, // 👈 force cast
      enum: Object.values(Role),
      default: Role.Customer,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook for hashing
userSchema.pre('save', async function (next) {
  const bcrypt = await import('bcryptjs');
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
  if (this.isModified('phoneVerificationToken'))
    this.phoneVerificationToken = await bcrypt.hash(this?.phoneVerificationToken!, 12);
  if (this.isModified('emailVerificationToken'))
    this.emailVerificationToken = await bcrypt.hash(this?.emailVerificationToken!, 12);
  next();
});

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  const jose = await import('jose');
  const accessToken = await new jose.SignJWT({
    id: this._id,
    username: this.username,
    email: this.email,
    phone: this.phone,
    role: this.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(jose.base64url.decode(process.env.ACCESS_TOKEN_SECRET!));
  return accessToken;
};
userSchema.methods.generateRefreshToken = async function () {
  const jose = await import('jose');
  const refreshToken = await new jose.SignJWT({
    id: this._id,
    username: this.username,
    email: this.email,
    phone: this.phone,
    role: this.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(jose.base64url.decode(process.env.REFRESH_TOKEN_SECRET!));
  return refreshToken;
};

const User = models.User || model('User', userSchema);

export default User;
