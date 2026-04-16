/**
 * 用户管理路由
 */

import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware as auth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', auth, userController.getMe);

/**
 * @route   PUT /api/v1/users/me
 * @desc    更新当前用户信息
 * @access  Private
 */
router.put('/me', auth, userController.updateMe);

/**
 * @route   PUT /api/v1/users/avatar
 * @desc    更新用户头像
 * @access  Private
 */
router.put('/avatar', auth, userController.updateAvatar);

/**
 * @route   GET /api/v1/users/:id
 * @desc    获取指定用户信息（管理员）
 * @access  Private/Admin
 */
router.get('/:id', userController.getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    更新指定用户信息（管理员）
 * @access  Private/Admin
 */
router.put('/:id', userController.updateUserById);

export default router;
