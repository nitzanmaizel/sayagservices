import { Router } from 'express';
import {
  createAdminUser,
  getAllAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  getAdminUserByEmail,
} from '../controllers/adminUserControllers';

const router: Router = Router();

router.post('/', createAdminUser);
router.get('/', getAllAdminUsers);
router.get('/:id', getAdminUserById);
router.get('/:email', getAdminUserByEmail);
router.put('/:id', updateAdminUser);
router.delete('/:id', deleteAdminUser);

export default router;
