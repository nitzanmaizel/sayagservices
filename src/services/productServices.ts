import Product, { IProduct } from '../models/productModal';

/**
 * Creates a new Product.
 * @param {Partial<IProduct>} productData - Data for the new product.
 * @returns {Promise<IProduct>} - The created product.
 * @throws Will throw an error if validation fails.
 */
export const createProductService = async (productData: Partial<IProduct>): Promise<IProduct> => {
  const newProduct = new Product(productData);
  return await newProduct.save();
};

/**
 * Retrieves all Products with optional pagination and sorting.
 * @param {number} page - The page number for pagination.
 * @param {number} limit - The number of records per page.
 * @param {string} sortBy - The field to sort by.
 * @param {string} order - The order of sorting ('asc' or 'desc').
 * @returns {Promise<{ total: number; page: number; limit: number; data: IProduct[] }>} - Paginated list of products.
 */
export const getAllProductsService = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'createdAt',
  order: string = 'asc'
): Promise<{ total: number; page: number; limit: number; data: IProduct[] }> => {
  const products = await Product.find()
    .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments();

  return {
    total,
    page,
    limit,
    data: products,
  };
};

/**
 * Retrieves a single Product by ID.
 * @param {string} id - The ID of the product.
 * @returns {Promise<IProduct | null>} - The product if found, otherwise null.
 */
export const getProductByIdService = async (id: string): Promise<IProduct | null> => {
  return await Product.findById(id);
};

/**
 * Updates an existing Product by ID.
 * @param {string} id - The ID of the product to update.
 * @param {Partial<IProduct>} updateData - The data to update.
 * @returns {Promise<IProduct | null>} - The updated product if found, otherwise null.
 */
export const updateProductService = async (
  id: string,
  updateData: Partial<IProduct>
): Promise<IProduct | null> => {
  return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Deletes a Product by ID.
 * @param {string} id - The ID of the product to delete.
 * @returns {Promise<IProduct | null>} - The deleted product if found, otherwise null.
 */
export const deleteProductService = async (id: string): Promise<IProduct | null> => {
  return await Product.findByIdAndDelete(id);
};
