/**
 * 社区路由
 */

import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller';
import { authMiddleware } from '../middleware/auth';
import { optionalAuthMiddleware } from '../middleware/auth';

const router = Router();
const communityController = new CommunityController();

/**
 * @route GET /community/posts
 * @desc 获取帖子列表
 * @access Public
 */
router.get('/posts', optionalAuthMiddleware, communityController.listPosts);

/**
 * @route GET /community/posts/:id
 * @desc 获取帖子详情
 * @access Public
 */
router.get('/posts/:id', optionalAuthMiddleware, communityController.getPostById);

/**
 * @route POST /community/posts
 * @desc 创建帖子
 * @access Private
 */
router.post('/posts', authMiddleware, communityController.createPost);

/**
 * @route PUT /community/posts/:id
 * @desc 更新帖子
 * @access Private
 */
router.put('/posts/:id', authMiddleware, communityController.updatePost);

/**
 * @route DELETE /community/posts/:id
 * @desc 删除帖子
 * @access Private
 */
router.delete('/posts/:id', authMiddleware, communityController.deletePost);

/**
 * @route POST /community/posts/:id/like
 * @desc 点赞帖子
 * @access Private
 */
router.post('/posts/:id/like', authMiddleware, communityController.likePost);

/**
 * @route GET /community/posts/:id/comments
 * @desc 获取评论列表
 * @access Public
 */
router.get('/posts/:id/comments', communityController.getComments);

/**
 * @route POST /community/posts/:id/comments
 * @desc 发表评论
 * @access Private
 */
router.post('/posts/:id/comments', authMiddleware, communityController.createComment);

export default router;
