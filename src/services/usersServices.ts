import User, { IUser } from '../models/UserModal';

/**
 * Creates a new User.
 * @param {Partial<IUser>} userData - Data for the new user.
 * @returns {Promise<IUser>} - The created user.
 * @throws Will throw an error if the email is already in use or if validation fails.
 */
export const createUserService = async (userData: Partial<IUser>): Promise<IUser> => {
  const { email } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const newUser = new User(userData);
  return await newUser.save();
};

/**
 * Retrieves all Users with optional pagination and sorting.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of records per page.
 * @param {string} sortBy - The field to sort by.
 * @param {string} order - The order of sorting ('asc' or 'desc').
 * @returns {Promise<{ total: number; page: number; limit: number; data: IUser[] }>} - Paginated list of admin users.
 */
export const getAllUsersService = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  order: string = 'asc'
): Promise<{ total: number; page: number; limit: number; users: IUser[] }> => {
  const users = await User.find()
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await User.countDocuments();
  return { total, page, limit, users };
};

/**
 * Retrieves a single User by ID.
 * @param {string} id - The ID of the user.
 * @returns {Promise<IUser | null>} - The user if found, otherwise null.
 */
export const getUserByIdService = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

/**
 * Updates an existing User by ID.
 * @param {string} id - The ID of the user to update.
 * @param {Partial<IUser>} updateData - The data to update.
 * @returns {Promise<IUser | null>} - The updated user if found, otherwise null.
 * @throws Will throw an error if the updated email is already in use.
 */
export const updateUserService = async (
  id: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  const { email } = updateData;

  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      throw new Error('Email already in use by another user');
    }
  }

  return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Deletes an User by ID.
 * @param {string} id - The ID of the user to delete.
 * @returns {Promise<IUser | null>} - The deleted user if found, otherwise null.
 */
export const deleteUserService = async (id: string): Promise<IUser | null> => {
  return await User.findByIdAndDelete(id);
};

/**
 * Finds an User by their email address.
 * @async
 * @function findUserByEmail
 * @param {string} email - The email address of the user to find.
 * @returns {Promise<IUser | null>} - Returns the found user or null if not found.
 * @throws Will throw an error if the database query fails.
 */
export const getUserByEmailService = async (email: string): Promise<IUser | null> => {
  try {
    return await User.findOne({ email });
  } catch (error: any) {
    console.error(`Error finding admin user by email (${email}):`, error);
    throw new Error('Failed to retrieve user');
  }
};
