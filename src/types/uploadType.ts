import { Decimal128, ObjectId } from 'mongoose';

enum fileType {
  image,
  doc,
  video,
}

type TypeUpload = {
  id?: ObjectId;
  public_id: string;
  secure_url: string;
  fileName: string;
  fileBits: string;
  type: fileType;
  duration?: Decimal128;
  format: string;
};

export type { TypeUpload };
