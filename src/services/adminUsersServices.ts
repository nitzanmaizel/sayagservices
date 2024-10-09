// src/services/adminUsersService.ts

import AdminUser, { IAdminUser } from '../models/UserModal';

/**
 * Creates a new Admin User.
 * @param {Partial<IAdminUser>} adminUserData - Data for the new admin user.
 * @returns {Promise<IAdminUser>} - The created admin user.
 * @throws Will throw an error if the email is already in use or if validation fails.
 */
export const createAdminUserService = async (
  adminUserData: Partial<IAdminUser>
): Promise<IAdminUser> => {
  const { email } = adminUserData;

  const existingUser = await AdminUser.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const newAdminUser = new AdminUser(adminUserData);
  return await newAdminUser.save();
};

/**
 * Retrieves all Admin Users with optional pagination and sorting.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of records per page.
 * @param {string} sortBy - The field to sort by.
 * @param {string} order - The order of sorting ('asc' or 'desc').
 * @returns {Promise<{ total: number; page: number; limit: number; data: IAdminUser[] }>} - Paginated list of admin users.
 */
export const getAllAdminUsersService = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  order: string = 'asc'
): Promise<{ total: number; page: number; limit: number; users: IAdminUser[] }> => {
  const adminUsers = await AdminUser.find()
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await AdminUser.countDocuments();
  return { total, page, limit, users: adminUsers };
};

/**
 * Retrieves a single Admin User by ID.
 * @param {string} id - The ID of the admin user.
 * @returns {Promise<IAdminUser | null>} - The admin user if found, otherwise null.
 */
export const getAdminUserByIdService = async (id: string): Promise<IAdminUser | null> => {
  return await AdminUser.findById(id);
};

/**
 * Updates an existing Admin User by ID.
 * @param {string} id - The ID of the admin user to update.
 * @param {Partial<IAdminUser>} updateData - The data to update.
 * @returns {Promise<IAdminUser | null>} - The updated admin user if found, otherwise null.
 * @throws Will throw an error if the updated email is already in use.
 */
export const updateAdminUserService = async (
  id: string,
  updateData: Partial<IAdminUser>
): Promise<IAdminUser | null> => {
  const { email } = updateData;

  if (email) {
    const existingUser = await AdminUser.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      throw new Error('Email already in use by another user');
    }
  }

  return await AdminUser.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Deletes an Admin User by ID.
 * @param {string} id - The ID of the admin user to delete.
 * @returns {Promise<IAdminUser | null>} - The deleted admin user if found, otherwise null.
 */
export const deleteAdminUserService = async (id: string): Promise<IAdminUser | null> => {
  return await AdminUser.findByIdAndDelete(id);
};

/**
 * Finds an Admin User by their email address.
 * @async
 * @function findAdminUserByEmail
 * @param {string} email - The email address of the admin user to find.
 * @returns {Promise<IAdminUser | null>} - Returns the found admin user or null if not found.
 * @throws Will throw an error if the database query fails.
 */
export const getAdminUserByEmailService = async (email: string): Promise<IAdminUser | null> => {
  try {
    const adminUser = await AdminUser.findOne({ email });
    return adminUser;
  } catch (error: any) {
    // Log the error details for debugging purposes
    console.error(`Error finding admin user by email (${email}):`, error);
    throw new Error('Failed to retrieve admin user');
  }
};
