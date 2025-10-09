import { Decimal128, ObjectId } from 'mongoose';

type TypeUpload = {
  id?: ObjectId;
  public_id: string;
  secure_url: string;
  fileName: string;
  fileBits: string;
  type: 'image' | 'video' | 'doc' | 'other';
  duration: Decimal128;
  format: string;
};

export type { TypeUpload };
