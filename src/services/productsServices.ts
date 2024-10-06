// src/controllers/productsController.ts
import { Request, Response } from 'express';
import Product, { IProduct } from '../models/productModal';

/**
 * Controller to create a new Product.
 * @async
 * @function createProduct
 * @param {Request} req - Express Request object containing the new product's data.
 * @param {Response} res - Express Response object to send back the response.
 * @returns {Promise<void>} - Sends the created product as JSON or an error message.
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProduct: IProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Controller to retrieve all Products.
 * @async
 * @function getAllProducts
 * @param {Request} req - Express Request object.
 * @param {Response} res - Express Response object to send back the list of products.
 * @returns {Promise<void>} - Sends an array of products as JSON or an error message.
 */
export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products: IProduct[] = await Product.find();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to retrieve a single Product by its ID.
 * @async
 * @function getProductById
 * @param {Request} req - Express Request object containing the product's ID in params.
 * @param {Response} res - Express Response object to send back the product or an error message.
 * @returns {Promise<void>} - Sends the requested product as JSON or an error message.
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to update an existing Product by its ID.
 * @async
 * @function updateProduct
 * @param {Request} req - Express Request object containing the product's ID and updated data.
 * @param {Response} res - Express Response object to send back the updated product or an error message.
 * @returns {Promise<void>} - Sends the updated product as JSON or an error message.
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(updatedProduct);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Controller to delete a Product by its ID.
 * @async
 * @function deleteProduct
 * @param {Request} req - Express Request object containing the product's ID.
 * @param {Response} res - Express Response object to confirm deletion or send an error message.
 * @returns {Promise<void>} - Sends a success message as JSON or an error message.
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
