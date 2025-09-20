import { ObjectId } from 'mongoose';
import { TypeUpload } from './uploadType';

export const ROLES = ['Admin', 'Customer', 'Seller', 'Visitor'] as const;
export type Role = (typeof ROLES)[number];

type TypeUser = {
  id?: ObjectId;
  firstName: string;
  lastName?: string;
  username: string;
  phone: string;
  phoneVerified: boolean;
  phoneVerificationToken?: string;
  email: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  password: string;
  provider: {
    facebook?: string;
    instagram?: string;
    google?: string;
  };
  uploads?: TypeUpload[]; // profile images, docs
  role: Role;
  createdAt: Date;
  updatedAt?: Date;
};

export type { TypeUser };
