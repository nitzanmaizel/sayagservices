import { Request, Response } from 'express';
import {
  createAdminUserService,
  getAllAdminUsersService,
  getAdminUserByIdService,
  updateAdminUserService,
  deleteAdminUserService,
  getAdminUserByEmailService,
} from '../services/adminUsersServices';
import { IAdminUser } from '../models/UserModal';

/**
 * Controller to create a new Admin User.
 * @async
 * @function createAdminUser
 * @param {Request} req - Express Request object containing the new admin user's data.
 * @param {Response} res - Express Response object to send back the response.
 * @returns {Promise<void>} - Sends the created admin user as JSON or an error message.
 */
export const createAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { newUser } = req.body as { newUser: Partial<IAdminUser> };
    const newAdminUser = await createAdminUserService(newUser);
    res.status(201).json(newAdminUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Controller to retrieve all Admin Users with pagination and sorting.
 * @async
 * @function getAllAdminUsers
 * @param {Request} req - Express Request object.
 * @param {Response} res - Express Response object to send back the list of admin users.
 * @returns {Promise<void>} - Sends an array of admin users as JSON or an error message.
 */
export const getAllAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) || 'asc';

    const result = await getAllAdminUsersService(page, limit, sortBy, order);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to retrieve a single Admin User by ID.
 * @async
 * @function getAdminUserById
 * @param {Request} req - Express Request object containing the admin user's ID in params.
 * @param {Response} res - Express Response object to send back the admin user or an error message.
 * @returns {Promise<void>} - Sends the requested admin user as JSON or an error message.
 */
export const getAdminUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminUserId = req.params.id;
    const adminUser = await getAdminUserByIdService(adminUserId);
    if (!adminUser) {
      res.status(404).json({ error: 'Admin User not found' });
      return;
    }
    res.json(adminUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to update an existing Admin User by ID.
 * @async
 * @function updateAdminUser
 * @param {Request} req - Express Request object containing the admin user's ID and updated data.
 * @param {Response} res - Express Response object to send back the updated admin user or an error message.
 * @returns {Promise<void>} - Sends the updated admin user as JSON or an error message.
 */
export const updateAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminUserId = req.params.id;
    const { updatedUser } = req.body;
    const updatedAdminUser = await updateAdminUserService(adminUserId, updatedUser);
    if (!updatedAdminUser) {
      res.status(404).json({ error: 'Admin User not found' });
      return;
    }
    res.json(updatedAdminUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Controller to delete an Admin User by ID.
 * @async
 * @function deleteAdminUser
 * @param {Request} req - Express Request object containing the admin user's ID.
 * @param {Response} res - Express Response object to confirm deletion or send an error message.
 * @returns {Promise<void>} - Sends a success message as JSON or an error message.
 */
export const deleteAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminUserId = req.params.id;
    const deletedAdminUser = await deleteAdminUserService(adminUserId);
    if (!deletedAdminUser) {
      res.status(404).json({ error: 'Admin User not found' });
      return;
    }
    res.json({ message: 'Admin User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to find an Admin User by email.
 * @async
 * @function findAdminUserByEmail
 * @param {Request} req - Express Request object containing the admin user's email in query.
 * @param {Response} res - Express Response object to send back the found admin user or an error message.
 * @returns {Promise<void>} - Sends the found admin user as JSON or an error message.
 */
export const getAdminUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ error: 'Email query parameter is required' });
      return;
    }

    const adminUser = await getAdminUserByEmailService(email);
    if (!adminUser) {
      res.status(404).json({ error: 'Admin User not found' });
      return;
    }

    res.json(adminUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
