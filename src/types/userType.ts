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
  phoneVerified?: boolean;
  phoneVerificationToken?: string | null;
  email: string;
  emailVerified?: boolean;
  emailVerificationToken?: string | null;
  password: string;
  refreshToken: string;
  provider: Provider;
  uploads?: Types.ObjectId[] | TypeUpload[]; // allow both populated and unpopulated forms
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
export type PublicUser = {
  _id: string; // string form of ObjectId
  firstName: string;
  lastName?: string | null;
  username: string;
  phone: string;
  phoneVerified: boolean;
  email: string;
  emailVerified: boolean;
  provider?: Provider;
  uploads?: string[]; // array of ids (string) or public URLs if you populate/transform
  role: Role;
  createdAt: Date;
  updatedAt?: Date;
  fullName?: string;
};

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
  uploads?: Types.ObjectId[] | TypeUpload[]; // accept strings too
};
export type UpdateUserInput = Partial<Omit<IUserBase, 'username' | 'email'>> & {
  // usually you don't want to allow username/email change without special flow
  uploads?: Types.ObjectId[] | string[];
};
