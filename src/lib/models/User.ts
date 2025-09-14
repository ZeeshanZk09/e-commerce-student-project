import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
});

export const User = model(userSchema, 'User');
