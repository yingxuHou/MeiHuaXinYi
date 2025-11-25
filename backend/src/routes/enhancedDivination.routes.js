/**
 * 增强版占卜路由
 * 集成AI解读功能的路由配置
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const EnhancedDivinationController = require('../controllers/enhancedDivination.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();
const controller = new EnhancedDivinationController();

// 请求时间记录中间件
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// 验证规则
const performDivinationValidation = [
  body('question')
    .notEmpty()
    .withMessage('占卜问题不能为空')
    .isLength({ min: 5, max: 200 })
    .withMessage('占卜问题长度应在5-200字符之间'),
  body('method')
    .notEmpty()
    .withMessage('起卦方法不能为空')
    .isIn(['time', 'number', 'manual'])
    .withMessage('起卦方法无效'),
  body('params')
    .optional()
    .isObject()
    .withMessage('起卦参数格式错误'),
  body('aiOptions')
    .optional()
    .isObject()
    .withMessage('AI选项格式错误')
];

const interpretationValidation = [
  param('id')
    .notEmpty()
    .withMessage('占卜ID不能为空'),
  body('customPrompt')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('自定义提示词长度应在10-500字符之间'),
  body('options')
    .optional()
    .isObject()
    .withMessage('选项格式错误')
];

const batchInterpretationValidation = [
  body('divinationIds')
    .isArray({ min: 1, max: 10 })
    .withMessage('占卜ID列表应为1-10个元素的数组'),
  body('divinationIds.*')
    .notEmpty()
    .withMessage('占卜ID不能为空'),
  body('template')
    .optional()
    .isObject()
    .withMessage('模板格式错误')
];

/**
 * 执行占卜并生成AI解读
 * POST /api/divination/perform-with-ai
 */
router.post('/perform-with-ai',
  authMiddleware.authenticate,
  performDivinationValidation,
  controller.performDivinationWithAI.bind(controller)
);

/**
 * 为现有占卜结果生成AI解读
 * POST /api/divination/:id/interpretation
 */
router.post('/:id/interpretation',
  authMiddleware.authenticate,
  interpretationValidation,
  controller.generateInterpretation.bind(controller)
);

/**
 * 检查AI服务状态
 * GET /api/divination/ai-status
 */
router.get('/ai-status',
  authMiddleware.authenticate,
  controller.checkAIStatus.bind(controller)
);

/**
 * 获取解读模板
 * GET /api/divination/interpretation-templates
 */
router.get('/interpretation-templates',
  authMiddleware.authenticate,
  controller.getInterpretationTemplates.bind(controller)
);

/**
 * 批量生成解读
 * POST /api/divination/batch-interpretation
 */
router.post('/batch-interpretation',
  authMiddleware.authenticate,
  batchInterpretationValidation,
  controller.batchGenerateInterpretation.bind(controller)
);

module.exports = router;
