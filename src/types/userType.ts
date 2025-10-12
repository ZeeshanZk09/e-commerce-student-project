import { Document, Model, Types } from 'mongoose';
import { TypeUpload } from './uploadType';

/**
 * Roles: keep this as a single source of truth for both runtime & TS.
 */
export const ROLES = ['Admin', 'Customer', 'Seller', 'Visitor'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Provider sub-object (social ids/handles)
 */
export interface Provider {
  facebook?: string | null;
  instagram?: string | null;
  google?: string | null;
}

/**
 * Base shape used for creation/update inputs and for the schema fields.
 * Fields that Mongoose may add (like _id, timestamps) are not included here.
 */
export interface IUserBase {
  firstName: string;
  lastName?: string | null;
  username: string;
  phone: string;
  phoneVerified: boolean;
  phoneVerificationToken?: string | null;
  email: string;
  emailVerified: boolean;
  emailVerificationToken?: string | null;
  password: string;
  refreshToken: string;
  provider?: Provider | null;
  uploads: Types.ObjectId[] | TypeUpload[] | null;
  profilePic?: {
    public_id: string;
    secure_url: string;
    fileName: string;
    fileBits: string;
    type: string;
    duration: number;
    format: string;
  } | null;
  coverPic?: {
    public_id: string;
    secure_url: string;
    fileName: string;
    fileBits: string;
    type: string;
    duration: number;
    format: string;
  } | null;
  role?: Role;
}

/**
 * Document interface that represents an actual Mongoose document instance.
 * Methods are declared here so TypeScript knows about instance methods.
 */
export interface IUserDocument extends IUserBase, Document<Types.ObjectId> {
  // mongoose Document already has _id, id, save(), etc.
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;

  // Virtuals
  fullName?: string;

  // Instance methods implemented on the schema
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}

/**
 * Model type which includes custom instance methods.
 * Use this for the `model` generic parameter: model<IUserDocument, UserModel>
 */
export interface IUserModel extends Model<IUserDocument, {}, IUserDocument> {
  // if you need static methods, declare them here, e.g.
  // findByUsername?(username: string): Promise<IUserDocument | null>;
}
/**
 * DTOs / helpers
 *
 * PublicUser: the object you can safely return to clients (no tokens/passwords).
 * Use this type for API responses.
 */
export type PublicUser = Omit<
  IUserBase,
  'password' | 'refreshToken' | 'emailVerificationToken' | 'phoneVerificationToken'
>;

/**
 * Input types
 */
export type CreateUserInput = Omit<
  IUserBase,
  | 'role'
  | 'refreshToken'
  | 'phoneVerified'
  | 'emailVerified'
  | 'emailVerificationToken'
  | 'phoneVerificationToken'
> & {
  // role can be provided optionally on create, otherwise defaults to Customer
  role?: Role;
  uploads?: Types.ObjectId[] | TypeUpload[] | null; // accept strings too
};

export type LoginUserInput = Pick<IUserBase, 'email' | 'phone' | 'username' | 'password'>;

export type UpdateUserInput = Partial<Omit<IUserBase, 'username' | 'email'>> & {
  // usually you don't want to allow username/email change without special flow
  uploads?: Types.ObjectId[] | string[];
};
