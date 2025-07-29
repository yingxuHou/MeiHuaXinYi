import { Router, Request, Response } from 'express';
const { body, validationResult } = require('express-validator');
import { User, Divination, Payment } from '../models';
import { authenticate } from '../middleware/auth';
import { successResponse, ErrorResponses, BusinessErrors } from '../utils/response';

const router = Router();

// 所有用户路由都需要认证
router.use(authenticate);

// 获取用户信息
router.get('/profile', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    // 获取用户统计信息
    const divinationStats = await Divination.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalDivinations: 0,
      completedDivinations: 0,
      pendingDivinations: 0
    };

    divinationStats.forEach(stat => {
      stats.totalDivinations += stat.count;
      if (stat._id === 'completed') {
        stats.completedDivinations = stat.count;
      } else if (stat._id === 'pending') {
        stats.pendingDivinations = stat.count;
      }
    });

    return successResponse(res, {
      user: {
        id: req.user._id,
        email: req.user.email,
        nickname: req.user.nickname,
        avatar: req.user.avatar,
        gender: req.user.gender,
        birthDate: req.user.birthDate,
        freeCount: req.user.freeCount,
        totalCount: req.user.totalCount,
        isActive: req.user.isActive,
        lastLoginAt: req.user.lastLoginAt,
        createdAt: req.user.createdAt
      },
      stats
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    return ErrorResponses.internalError(res, '获取用户信息失败');
  }
});

// 更新用户信息
router.put('/profile', [
  body('nickname')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('昵称长度应在2-20个字符之间'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('性别值无效'),
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('出生日期格式无效')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ErrorResponses.validationError(res, '用户信息验证失败', errors.array());
    }

    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    const { nickname, gender, birthDate } = req.body;

    // 更新用户信息
    const updateData: any = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (gender !== undefined) updateData.gender = gender;
    if (birthDate !== undefined) updateData.birthDate = new Date(birthDate);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return BusinessErrors.userNotFound(res);
    }

    return successResponse(res, {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        avatar: updatedUser.avatar,
        gender: updatedUser.gender,
        birthDate: updatedUser.birthDate,
        freeCount: updatedUser.freeCount,
        totalCount: updatedUser.totalCount,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('更新用户信息错误:', error);
    return ErrorResponses.internalError(res, '更新用户信息失败');
  }
});

// 获取用户统计信息
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    // 获取占卜统计
    const divinationStats = await Divination.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            status: '$status',
            category: '$category'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // 获取支付统计
    const paymentStats = await Payment.aggregate([
      { $match: { userId: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: '$packageType',
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: '$count' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // 获取最近的占卜记录
    const recentDivinations = await Divination.find({
      userId: req.user._id,
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('question category createdAt');

    return successResponse(res, {
      divination: divinationStats,
      payment: paymentStats,
      recent: recentDivinations,
      summary: {
        freeCount: req.user.freeCount,
        totalCount: req.user.totalCount,
        memberSince: req.user.createdAt
      }
    });

  } catch (error) {
    console.error('获取用户统计错误:', error);
    return ErrorResponses.internalError(res, '获取统计信息失败');
  }
});

// 管理免费次数（内部使用）
router.post('/free-count/decrement', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    if (req.user.freeCount <= 0) {
      return BusinessErrors.insufficientBalance(res);
    }

    // 减少免费次数
    const updatedUser = await req.user.decrementFreeCount();

    return successResponse(res, {
      freeCount: updatedUser.freeCount,
      message: '免费次数已扣减'
    });

  } catch (error) {
    console.error('扣减免费次数错误:', error);
    return ErrorResponses.internalError(res, '扣减次数失败');
  }
});

// 增加总次数（支付成功后调用）
router.post('/total-count/increment', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    // 增加总次数
    const updatedUser = await req.user.incrementTotalCount();

    return successResponse(res, {
      totalCount: updatedUser.totalCount,
      message: '总次数已增加'
    });

  } catch (error) {
    console.error('增加总次数错误:', error);
    return ErrorResponses.internalError(res, '增加次数失败');
  }
});

// 获取用户的占卜历史
router.get('/divinations', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const category = req.query.category as string;

    // 构建查询条件
    const query: any = { userId: req.user._id };
    if (status) query.status = status;
    if (category) query.category = category;

    // 获取总数
    const total = await Divination.countDocuments(query);

    // 获取分页数据
    const divinations = await Divination.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-userId'); // 不返回userId字段

    return successResponse(res, divinations, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取占卜历史错误:', error);
    return ErrorResponses.internalError(res, '获取占卜历史失败');
  }
});

// 获取用户的支付历史
router.get('/payments', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const total = await Payment.countDocuments({ userId: req.user._id });

    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-userId -metadata.ipAddress'); // 不返回敏感信息

    return successResponse(res, payments, 200, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取支付历史错误:', error);
    return ErrorResponses.internalError(res, '获取支付历史失败');
  }
});

export default router;
