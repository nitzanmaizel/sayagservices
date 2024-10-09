import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productControllers';
import { upload } from '../config/cloudinary';
import { authenticateJWT, refreshTokenMiddleware } from '../middleware';

const router: Router = Router();

router.get('/', getAllProducts);
router.get('/:productId', getProductById);

router.use(authenticateJWT, refreshTokenMiddleware);
router.post('/', upload.single('image'), createProduct);
router.put('/:productId', upload.single('image'), updateProduct);
router.delete('/:productId', deleteProduct);

export default router;
