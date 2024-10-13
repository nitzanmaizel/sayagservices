import { Schema, model, Document } from 'mongoose';
import encrypt from 'mongoose-encryption';

export interface IAdminUser extends Document {
  name: string;
  email: string;
  isAdmin: boolean;
  googleId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiryDate?: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    googleId: { type: String, required: true, unique: true },
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

adminUserSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: ['accessToken', 'refreshToken'],
  requireAuthenticationCode: false,
});

const AdminUser = model<IAdminUser>('AdminUser', adminUserSchema);
export default AdminUser;
