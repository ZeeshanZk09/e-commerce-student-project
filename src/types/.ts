// types/user.ts
import { Document, Model, Types } from 'mongoose';
import { TypeUpload } from './uploadType';

/**
 * Roles (single source of truth)
 * Add/remove roles as your app evolves.
 */
export const ROLES = ['Admin', 'Customer', 'Seller', 'Visitor'] as const;
export type Role = (typeof ROLES)[number];

/**
 * KYC / Verification enums used by vendor onboarding
 */
export type KycStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected';
export type VerificationProvider = 'email' | 'phone' | 'govId' | 'businessDoc';

/**
 * Small reusable address shape used across user/vendor
 */
export interface Address {
  id?: string; // client-friendly id for addresses
  label?: string; // e.g. "Home", "Office"
  firstName?: string;
  lastName?: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string; // ISO country code preferred
  phone?: string;
  // optional geo location for radius searches / nearest vendor
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

/**
 * Provider sub-object (social ids/handles)
 */
export interface Provider {
  facebook?: string | null;
  instagram?: string | null;
  google?: string | null;
  // oauth provider tokens should not be stored raw unless encrypted
}

/**
 * Vendor-specific profile for multi-vendor support
 */
export interface VendorProfile {
  storeName?: string;
  storeSlug?: string; // unique slug for public store url
  description?: string;
  categories?: string[]; // categories the vendor sells in
  storeLogo?: Types.ObjectId | string | TypeUpload | null;
  banner?: Types.ObjectId | string | TypeUpload | null;
  businessName?: string; // legal name
  taxId?: string | null;
  businessAddress?: Address | null;
  payoutMethods?: Array<{
    // reference to a Payout/Payment method document or external id
    id: Types.ObjectId | string;
    type: 'bank_account' | 'paypal' | 'stripe' | 'other';
    label?: string;
    last4?: string; // masked account detail
    isDefault?: boolean;
  }>;
  kycStatus?: KycStatus;
  kycDocuments?: Array<Types.ObjectId | string | TypeUpload>; // uploads of IDs/business docs
  isApproved?: boolean; // admin flag
  approvedAt?: Date | null;
  rejectedReason?: string | null;
  metadata?: Record<string, unknown>; // extra fields if needed
}

/**
 * Base shape used for creation/update inputs and for the schema fields.
 * Keep it small — Add fields you'd store in Mongo as part of the user doc.
 */
export interface IUserBase {
  firstName: string;
  lastName?: string | null;
  username: string;
  phone: string;
  phoneVerified?: boolean;
  phoneVerificationToken?: string | null; // hashed, select: false in schema
  email: string;
  emailVerified?: boolean;
  emailVerificationToken?: string | null; // hashed, select: false
  password?: string; // required only for local accounts
  refreshToken?: string | null; // hashed, select: false
  provider?: Provider;
  uploads?: (Types.ObjectId | string)[] | TypeUpload[]; // allow populated & unpopulated
  role?: Role;
  addresses?: Address[];
  vendorProfile?: VendorProfile | null;
  // Security/audit fields
  lastLogin?: Date | null;
  loginAttempts?: number;
  lockUntil?: Date | null;
  isActive?: boolean; // soft-deactivate account
  deletedAt?: Date | null; // soft-delete timestamp
  // small flexible metadata bag for feature flags, preferences etc.
  preferences?: {
    locale?: string;
    currency?: string;
    marketingEmails?: boolean;
    [key: string]: unknown;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document interface that represents an actual Mongoose document instance.
 * Methods are declared here so TypeScript knows about instance methods.
 */
export interface IUserDocument extends IUserBase, Document<Types.ObjectId> {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;

  // Virtuals
  fullName?: string;

  // Instance methods (implement these on the schema)
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
  generatePasswordResetToken?(): Promise<string>;
  invalidateRefreshTokens?(reason?: string): Promise<void>;
  hasPermission?(permission: string): boolean;
  toPublic?(): PublicUser;
}

/**
 * Model type which includes custom static methods.
 */
export interface IUserModel extends Model<IUserDocument, {}, IUserDocument> {
  // common statics useful in production
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByUsername(username: string): Promise<IUserDocument | null>;
  findByPhone(phone: string): Promise<IUserDocument | null>;
  // Admin helpers
  paginate?(filter: Record<string, unknown>, options: Record<string, unknown>): Promise<any>;
}

/**
 * DTOs / helpers
 *
 * PublicUser: safe serializable object returned to API clients.
 * NOTE: never include password, tokens, verification tokens here.
 */
export type PublicUser = {
  id: string; // string form of ObjectId
  firstName: string;
  lastName?: string | null;
  username: string;
  phone?: string | null;
  phoneVerified?: boolean;
  email?: string | null;
  emailVerified?: boolean;
  provider?: Provider;
  uploads?: string[]; // array of ids or public URLs
  role: Role;
  addresses?: Address[];
  vendorProfile?: {
    storeName?: string;
    storeSlug?: string;
    description?: string;
    storeLogo?: string | null;
    isApproved?: boolean;
  } | null;
  preferences?: {
    locale?: string;
    currency?: string;
    marketingEmails?: boolean;
    [k: string]: unknown;
  };
  createdAt: Date;
  updatedAt?: Date;
  fullName?: string;
};

/**
 * Input types
 *
 * CreateUserInput: used for signup / admin create
 * - we purposely omit sensitive fields that should be created by server
 */
export type CreateUserInput = Omit<
  IUserBase,
  | 'createdAt'
  | 'updatedAt'
  | 'lastLogin'
  | 'loginAttempts'
  | 'lockUntil'
  | 'deletedAt'
  | 'refreshToken'
  | 'phoneVerificationToken'
  | 'emailVerificationToken'
> & {
  // allow client to provide vendorProfile for vendor signups but keep server-side checks
  vendorProfile?: Partial<VendorProfile>;
  uploads?: (Types.ObjectId | string)[];
  // accept phone/email as primary identifiers (strings), DB will enforce uniqueness
  password?: string;
  role?: Role;
};

/**
 * UpdateUserInput: partial updates, admin flows may allow more fields
 */
export type UpdateUserInput = Partial<
  Omit<
    IUserBase,
    | 'username' // recommend special flow to change username
    | 'email' // recommend verification flow to change email
    | 'createdAt'
    | 'deletedAt'
    | '_id'
  >
> & {
  addresses?: Address[]; // full replace or patch depending on API design
  vendorProfile?: Partial<VendorProfile>;
  uploads?: (Types.ObjectId | string)[];
};

/**
 * Helper: mapped types that help express populated vs unpopulated relations
 * Example: IUserDocument['uploads'] may contain ObjectId[] or TypeUpload[] after populate
 */
export type MaybePopulated<T> = T | (T extends (Types.ObjectId | string)[] ? TypeUpload[] : T);

export { TypeUpload, Types };
