import { Schema, model, Document } from 'mongoose';
import encrypt from 'mongoose-encryption';

export interface IUser extends Document {
  name: string;
  email: string;
  isAdmin: boolean;
  googleId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiryDate?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    googleId: { type: String, unique: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiryDate: { type: Date },
  },
  { timestamps: true }
);

const encKey = process.env.ENC_KEY;
const sigKey = process.env.SIG_KEY;

if (!encKey || !sigKey) {
  throw new Error('Encryption keys (ENC_KEY and SIG_KEY) must be set in environment variables.');
}

const encKeyBuffer = Buffer.from(encKey, 'base64');
const sigKeyBuffer = Buffer.from(sigKey, 'base64');

if (encKeyBuffer.length !== 32) {
  throw new Error('ENC_KEY must be 32 bytes after base64 decoding.');
}
if (sigKeyBuffer.length !== 64) {
  throw new Error('SIG_KEY must be 64 bytes after base64 decoding.');
}

userSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ['accessToken', 'refreshToken'],
  requireAuthenticationCode: false,
});

const User = model<IUser>('users', userSchema);
export default User;
