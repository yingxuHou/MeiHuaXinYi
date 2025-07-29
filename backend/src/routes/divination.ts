import { Router, Request, Response } from 'express';
const { body, validationResult } = require('express-validator');
import { Divination, IDivination, IHexagram, IAIInterpretation } from '../models';
import { authenticate, checkDivinationBalance } from '../middleware/auth';
import { successResponse, ErrorResponses, BusinessErrors } from '../utils/response';

const router = Router();

// 所有占卜路由都需要认证
router.use(authenticate);

// 模拟的64卦基础数据（简化版）
const MOCK_HEXAGRAMS = [
  { number: 1, name: '乾卦', symbol: '☰', lines: ['阳', '阳', '阳', '阳', '阳', '阳'] },
  { number: 2, name: '坤卦', symbol: '☷', lines: ['阴', '阴', '阴', '阴', '阴', '阴'] },
  { number: 3, name: '屯卦', symbol: '☳', lines: ['阳', '阴', '阴', '阴', '阳', '阴'] },
  { number: 4, name: '蒙卦', symbol: '☶', lines: ['阴', '阳', '阴', '阴', '阴', '阳'] },
  // ... 这里应该有完整的64卦数据，暂时用几个示例
];

// 模拟梅花易数算法
function generateMockHexagram(question: string, timestamp: Date): IHexagram {
  // 简单的模拟算法：基于问题长度和时间戳生成卦象
  const questionLength = question.length;
  const timeNumber = timestamp.getTime();
  
  // 生成本卦
  const originalIndex = (questionLength + timeNumber) % MOCK_HEXAGRAMS.length;
  const original = MOCK_HEXAGRAMS[originalIndex];
  
  // 生成变爻（随机1-2个变爻）
  const changingLines: number[] = [];
  const changeCount = Math.floor(Math.random() * 2) + 1; // 1-2个变爻
  
  for (let i = 0; i < changeCount; i++) {
    const line = Math.floor(Math.random() * 6) + 1;
    if (!changingLines.includes(line)) {
      changingLines.push(line);
    }
  }
  
  // 生成变卦
  let changed = null;
  if (changingLines.length > 0) {
    const changedLines = [...original.lines];
    changingLines.forEach(lineIndex => {
      const arrayIndex = lineIndex - 1;
      changedLines[arrayIndex] = changedLines[arrayIndex] === '阳' ? '阴' : '阳';
    });
    
    // 简单匹配变卦（实际应该有完整的卦象匹配逻辑）
    const changedIndex = (originalIndex + changingLines.length) % MOCK_HEXAGRAMS.length;
    const changedHexagram = MOCK_HEXAGRAMS[changedIndex];
    
    changed = {
      name: changedHexagram.name,
      symbol: changedHexagram.symbol,
      number: changedHexagram.number,
      lines: changedLines
    };
  }
  
  return {
    original,
    changed: changed || undefined,
    changingLines
  };
}

// 模拟AI解读
function generateMockAIInterpretation(question: string, hexagram: IHexagram): IAIInterpretation {
  const categories = {
    '事业': {
      overall: '事业运势整体向好，需要把握时机',
      advice: ['保持积极态度', '注重团队合作', '谨慎决策'],
      timing: '近期是发展的好时机'
    },
    '感情': {
      overall: '感情方面需要更多沟通和理解',
      advice: ['多关心对方', '坦诚相待', '避免争吵'],
      timing: '耐心等待，时机未到'
    },
    '健康': {
      overall: '身体状况良好，注意预防',
      advice: ['规律作息', '适量运动', '均衡饮食'],
      timing: '现在是调养身体的好时候'
    },
    '财运': {
      overall: '财运平稳，有小幅增长',
      advice: ['理性投资', '开源节流', '避免冒险'],
      timing: '稳扎稳打，不宜急进'
    }
  };
  
  // 简单的关键词匹配
  let category = '其他';
  for (const [key, value] of Object.entries(categories)) {
    if (question.includes(key) || question.includes(key.slice(0, 1))) {
      category = key;
      break;
    }
  }
  
  const template = categories[category as keyof typeof categories] || {
    overall: '运势变化较大，需要谨慎应对',
    advice: ['保持冷静', '仔细观察', '适时而动'],
    timing: '时机尚未成熟，需要等待'
  };
  
  return {
    overall: template.overall,
    advice: template.advice,
    warning: hexagram.changingLines.length > 1 ? '变化较多，需要特别注意' : undefined,
    timing: template.timing,
    confidence: 0.75 + Math.random() * 0.2 // 0.75-0.95的置信度
  };
}

// 提交占卜请求
router.post('/submit', [
  body('question')
    .isLength({ min: 5, max: 500 })
    .withMessage('问题长度应在5-500个字符之间')
    .trim(),
  body('category')
    .optional()
    .isIn(['事业', '感情', '健康', '财运', '学业', '家庭', '其他'])
    .withMessage('问题分类无效')
], checkDivinationBalance, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ErrorResponses.validationError(res, '占卜请求验证失败', errors.array());
    }

    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    const { question, category = '其他' } = req.body;
    const timestamp = new Date();

    // 生成卦象（模拟）
    const hexagram = generateMockHexagram(question, timestamp);
    
    // 生成AI解读（模拟）
    const aiInterpretation = generateMockAIInterpretation(question, hexagram);

    // 创建占卜记录
    const divination = new Divination({
      userId: req.user._id,
      question,
      category,
      hexagram,
      aiInterpretation,
      status: 'completed', // 模拟直接完成
      isPaid: req.user.freeCount <= 0, // 如果没有免费次数，标记为付费
      metadata: {
        timestamp,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await divination.save();

    // 扣减免费次数
    if (req.user.freeCount > 0) {
      await req.user.decrementFreeCount();
    }

    return successResponse(res, {
      divinationId: divination._id,
      status: 'completed',
      result: {
        question: divination.question,
        category: divination.category,
        hexagram: divination.hexagram,
        aiInterpretation: divination.aiInterpretation,
        createdAt: divination.createdAt
      },
      userBalance: {
        freeCount: req.user.freeCount - 1,
        totalCount: req.user.totalCount
      }
    }, 201);

  } catch (error) {
    console.error('占卜提交错误:', error);
    return ErrorResponses.internalError(res, '占卜提交失败');
  }
});

// 获取占卜结果
router.get('/result/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    const { id } = req.params;

    const divination = await Divination.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!divination) {
      return BusinessErrors.divinationNotFound(res);
    }

    return successResponse(res, {
      id: divination._id,
      question: divination.question,
      category: divination.category,
      hexagram: divination.hexagram,
      aiInterpretation: divination.aiInterpretation,
      status: divination.status,
      createdAt: divination.createdAt
    });

  } catch (error) {
    console.error('获取占卜结果错误:', error);
    return ErrorResponses.internalError(res, '获取占卜结果失败');
  }
});

// 获取占卜历史
router.get('/history', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const status = req.query.status as string;

    // 构建查询条件
    const query: any = { userId: req.user._id };
    if (category) query.category = category;
    if (status) query.status = status;

    const total = await Divination.countDocuments(query);

    const divinations = await Divination.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('question category status createdAt hexagram.original.name');

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

// 删除占卜记录
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    const { id } = req.params;

    const divination = await Divination.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!divination) {
      return BusinessErrors.divinationNotFound(res);
    }

    return successResponse(res, {
      message: '占卜记录已删除',
      deletedId: id
    });

  } catch (error) {
    console.error('删除占卜记录错误:', error);
    return ErrorResponses.internalError(res, '删除占卜记录失败');
  }
});

// 获取占卜统计
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    const stats = await Divination.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: {
            category: '$category',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return successResponse(res, {
      stats,
      userBalance: {
        freeCount: req.user.freeCount,
        totalCount: req.user.totalCount
      }
    });

  } catch (error) {
    console.error('获取占卜统计错误:', error);
    return ErrorResponses.internalError(res, '获取占卜统计失败');
  }
});

export default router;
