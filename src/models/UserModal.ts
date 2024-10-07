import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a User document in MongoDB.
 * @interface IAdminUser
 * @extends Document
 */
export interface IAdminUser extends Document {
  name: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Mongoose Schema for the User model.
 * @constant userAdminSchema
 * @type {Schema<IAdminUser>}
 */
const userAdminSchema: Schema<IAdminUser> = new Schema<IAdminUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Mongoose Model for Users.
 * @constant AdminUser
 * @type {Model<IAdminUser>}
 */
const AdminUser = model<IAdminUser>('adminUsers', userAdminSchema);

export default AdminUser;
