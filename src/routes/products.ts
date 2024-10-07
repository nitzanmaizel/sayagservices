import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productControllers';
import { upload } from '../config/cloudinary';

const router: Router = Router();

router.post('/', upload.single('image'), createProduct);
router.get('/', getAllProducts);
router.get('/:productId', getProductById);
router.put('/:productId', upload.single('image'), updateProduct);
router.delete('/:productId', deleteProduct);

export default router;
