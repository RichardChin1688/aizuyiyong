/**
 * 社区控制器
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/requestLogger';

export class CommunityController {
  /**
   * 获取帖子列表
   */
  async listPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', limit = '10', category, isPinned } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (category) where.category = category;
      if (isPinned === 'true') where.isPinned = true;

      const total = await prisma.communityPost.count({ where });

      const posts = await prisma.communityPost.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          _count: { select: { comments: true } },
        },
      });

      res.json({
        success: true,
        data: { list: posts, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取帖子详情
   */
  async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const post = await prisma.communityPost.findUnique({
        where: { id: BigInt(id) },
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          comments: {
            include: { user: { select: { id: true, nickname: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!post) throw new NotFoundError('帖子不存在');

      // 增加浏览量
      await prisma.communityPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建帖子
   */
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { title, content, category } = req.body;

      if (!title || !content) throw new BadRequestError('标题和内容不能为空');

      const post = await prisma.communityPost.create({
        data: {
          userId: BigInt(userId),
          title,
          content,
          category: category || 'general',
        },
      });

      res.status(201).json({ success: true, data: post, message: '发布成功' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新帖子
   */
  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;
      const { title, content } = req.body;

      const post = await prisma.communityPost.findFirst({
        where: { id: BigInt(id), userId: BigInt(userId) },
      });

      if (!post) throw new NotFoundError('帖子不存在或无权限');

      const updated = await prisma.communityPost.update({
        where: { id: post.id },
        data: { title, content },
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除帖子
   */
  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;

      const post = await prisma.communityPost.findFirst({
        where: { id: BigInt(id), userId: BigInt(userId) },
      });

      if (!post) throw new NotFoundError('帖子不存在或无权限');

      await prisma.communityPost.delete({ where: { id: post.id } });

      res.json({ success: true, message: '删除成功' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 点赞帖子
   */
  async likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.communityPost.update({
        where: { id: BigInt(id) },
        data: { likeCount: { increment: 1 } },
      });

      res.json({ success: true, message: '已点赞' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取评论列表
   */
  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const total = await prisma.communityComment.count({ where: { postId: BigInt(id) } });

      const comments = await prisma.communityComment.findMany({
        where: { postId: BigInt(id) },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
        },
      });

      res.json({
        success: true,
        data: { list: comments, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 发表评论
   */
  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).userId!;
      const { id } = req.params;
      const { content, parentId } = req.body;

      if (!content) throw new BadRequestError('评论内容不能为空');

      const post = await prisma.communityPost.findUnique({ where: { id: BigInt(id) } });
      if (!post) throw new NotFoundError('帖子不存在');

      const comment = await prisma.communityComment.create({
        data: {
          postId: post.id,
          userId: BigInt(userId),
          content,
          parentId: parentId ? BigInt(parentId) : null,
        },
      });

      // 增加评论数
      await prisma.communityPost.update({
        where: { id: post.id },
        data: { commentCount: { increment: 1 } },
      });

      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
}
