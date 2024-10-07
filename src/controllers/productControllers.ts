import { Request, Response } from 'express';
import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from '../services/productServices';
import { ProductType } from '../types/ProductType';
import { uploadToCloudinary } from '../config/cloudinary';

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
    const { name, description, price } = req.body;

    if (!name || !description || !price) {
      res.status(400).json({ error: 'Name, description, and price are required' });
      return;
    }

    const productData: ProductType = { name, description, price };

    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file, 'products');
        productData.imageUrl = imageUrl;
      } catch (uploadError: any) {
        console.error('Cloudinary Upload Error:', uploadError);
        res.status(500).json({ error: 'Image upload failed' });
        return;
      }
    }

    const newProduct = await createProductService(productData);
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Controller to retrieve all Products with pagination and sorting.
 * @async
 * @function getAllProducts
 * @param {Request} req - Express Request object.
 * @param {Response} res - Express Response object to send back the list of products.
 * @returns {Promise<void>} - Sends an array of products as JSON or an error message.
 */
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const order = (req.query.order as string) || 'asc';

    const result = await getAllProductsService(page, limit, sortBy, order);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Controller to retrieve a single Product by ID.
 * @async
 * @function getProductById
 * @param {Request} req - Express Request object containing the product's ID in params.
 * @param {Response} res - Express Response object to send back the product or an error message.
 * @returns {Promise<void>} - Sends the requested product as JSON or an error message.
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const product = await getProductByIdService(productId);
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
 * Controller to update an existing Product by ID.
 * @async
 * @function updateProduct
 * @param {Request} req - Express Request object containing the product's ID and updated data.
 * @param {Response} res - Express Response object to send back the updated product or an error message.
 * @returns {Promise<void>} - Sends the updated product as JSON or an error message.
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const updateData = req.body;

    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file, 'products');
        updateData.imageUrl = imageUrl;
      } catch (uploadError: any) {
        console.error('Cloudinary Upload Error:', uploadError);
        res.status(500).json({ error: 'Image upload failed' });
        return;
      }
    }

    const updatedProduct = await updateProductService(productId, updateData);
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
 * Controller to delete a Product by ID.
 * @async
 * @function deleteProduct
 * @param {Request} req - Express Request object containing the product's ID.
 * @param {Response} res - Express Response object to confirm deletion or send an error message.
 * @returns {Promise<void>} - Sends a success message as JSON or an error message.
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = req.params.id;
    const deletedProduct = await deleteProductService(productId);
    if (!deletedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
