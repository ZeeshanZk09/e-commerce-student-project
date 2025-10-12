import { TypeUpload } from '@/types/uploadType';
import { model, Schema } from 'mongoose';

const uploadSchema = new Schema<TypeUpload>({
  public_id: {
    type: String,
    required: [true, 'Public ID is required.'],
  },
  secure_url: {
    type: String,
    required: [true, 'Secure URL is required.'],
  },
  fileName: {
    type: String,
    required: [true, 'File name is required.'],
  },
  fileBits: {
    type: String,
    required: [true, 'File bits is required.'],
  },
  type: {
    type: String,
    required: [true, 'Type is required.'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required.'],
  },
  format: {
    type: String,
    required: [true, 'Format is required.'],
  },
});

export const Upload = model<TypeUpload>('Upload', uploadSchema);
