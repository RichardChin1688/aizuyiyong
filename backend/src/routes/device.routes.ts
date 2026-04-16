/**
 * 设备路由
 */

import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { authMiddleware } from '../middleware/auth';
import { optionalAuthMiddleware } from '../middleware/auth';

const router = Router();
const deviceController = new DeviceController();

/**
 * @route GET /devices
 * @desc 获取设备列表 (支持筛选、分页)
 * @access Public
 */
router.get('/', optionalAuthMiddleware, deviceController.list);

/**
 * @route GET /devices/hot
 * @desc 获取热门设备
 * @access Public
 */
router.get('/hot', deviceController.getHotDevices);

/**
 * @route GET /devices/categories
 * @desc 获取设备分类
 * @access Public
 */
router.get('/categories', deviceController.getCategories);

/**
 * @route GET /devices/:id
 * @desc 获取设备详情
 * @access Public
 */
router.get('/:id', optionalAuthMiddleware, deviceController.getById);

/**
 * @route POST /devices
 * @desc 创建设备 (管理员)
 * @access Private (Admin)
 */
router.post('/', authMiddleware, deviceController.create);

/**
 * @route PUT /devices/:id
 * @desc 更新设备 (管理员)
 * @access Private (Admin)
 */
router.put('/:id', authMiddleware, deviceController.update);

/**
 * @route DELETE /devices/:id
 * @desc 删除设备 (管理员)
 * @access Private (Admin)
 */
router.delete('/:id', authMiddleware, deviceController.delete);

/**
 * @route POST /devices/:id/toggle-status
 * @desc 切换设备上架/下架状态 (管理员)
 * @access Private (Admin)
 */
router.post('/:id/toggle-status', authMiddleware, deviceController.toggleStatus);

export default router;
