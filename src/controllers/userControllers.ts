import { Request, Response } from 'express';
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  getUserByEmailService,
} from '../services/usersServices';
import { IUser } from '../models/UserModal';

/**
 * Controller to create a new User.
 * @async
 * @function createUser
 * @param {Request} req - Express Request object containing the new user's data.
 * @param {Response} res - Express Response object to send back the response.
 * @returns {Promise<void>} - Sends the created user as JSON or an error message.
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { newUser } = req.body as { newUser: Partial<IUser> };
    const user = await createUserService(newUser);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Controller to retrieve all Users with pagination and sorting.
 * @async
 * @function getAllUsers
 * @param {Request} req - Express Request object.
 * @param {Response} res - Express Response object to send back the list of users.
 * @returns {Promise<void>} - Sends an array of users as JSON or an error message.
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) || 'asc';

    const result = await getAllUsersService(page, limit, sortBy, order);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to retrieve a single User by ID.
 * @async
 * @function getUserById
 * @param {Request} req - Express Request object containing the user's ID in params.
 * @param {Response} res - Express Response object to send back the user or an error message.
 * @returns {Promise<void>} - Sends the requested user as JSON or an error message.
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await getUserByIdService(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to update an existing User by ID.
 * @async
 * @function updateUser
 * @param {Request} req - Express Request object containing the user's ID and updated data.
 * @param {Response} res - Express Response object to send back the updated user or an error message.
 * @returns {Promise<void>} - Sends the updated user as JSON or an error message.
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { updatedUser } = req.body;
    const user = await updateUserService(userId, updatedUser);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Controller to delete an User by ID.
 * @async
 * @function deleteUser
 * @param {Request} req - Express Request object containing the user's ID.
 * @param {Response} res - Express Response object to confirm deletion or send an error message.
 * @returns {Promise<void>} - Sends a success message as JSON or an error message.
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const deletedUser = await deleteUserService(userId);
    if (!deletedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to find an User by email.
 * @async
 * @function findUserByEmail
 * @param {Request} req - Express Request object containing the user's email in query.
 * @param {Response} res - Express Response object to send back the found user or an error message.
 * @returns {Promise<void>} - Sends the found user as JSON or an error message.
 */
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ error: 'Email query parameter is required' });
      return;
    }

    const user = await getUserByEmailService(email);
    if (!user) {
      res.status(404).json({ error: 'Admin User not found' });
      return;
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
