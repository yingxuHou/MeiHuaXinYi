/**
 * 梅花心易 - 输入验证工具
 * 使用express-validator进行数据验证
 */

const { body, param, query } = require('express-validator');

/**
 * 用户注册验证规则
 */
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('密码长度必须在6-128个字符之间')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true // 可选字段

      // 清理输入：移除空格、横线、括号等分隔符
      const cleaned = value.replace(/[\s\-\(\)\+]/g, '')

      // 验证格式：11位数字且以1开头
      const phoneRegex = /^1[0-9]\d{9}$/
      if (!phoneRegex.test(cleaned)) {
        throw new Error('请输入有效的11位手机号，如：138****8000')
      }

      return true
    }),

  body('profile.nickname')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('昵称最多30个字符'),

  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other', ''])
    .withMessage('性别值无效'),

  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('个人简介最多200个字符')
];

/**
 * 用户登录验证规则
 */
const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('用户名或邮箱不能为空'),

  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),

  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('记住我选项必须是布尔值')
];

/**
 * 刷新令牌验证规则
 */
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('刷新令牌不能为空')
    .isJWT()
    .withMessage('刷新令牌格式不正确')
];

/**
 * 更新个人资料验证规则
 */
const validateUpdateProfile = [
  body('profile.nickname')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('昵称最多30个字符'),

  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other', ''])
    .withMessage('性别值无效'),

  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('个人简介最多200个字符'),

  body('profile.location.province')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('省份名称最多50个字符'),

  body('profile.location.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('城市名称最多50个字符'),

  body('profile.location.district')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('区县名称最多50个字符'),

  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true // 可选字段

      // 清理输入：移除空格、横线、括号等分隔符
      const cleaned = value.replace(/[\s\-\(\)\+]/g, '')

      // 验证格式：11位数字且以1开头
      const phoneRegex = /^1[0-9]\d{9}$/
      if (!phoneRegex.test(cleaned)) {
        throw new Error('请输入有效的11位手机号，如：138****8000')
      }

      return true
    })
];

/**
 * 更新生辰八字验证规则
 */
const validateUpdateBirthInfo = [
  body('birthInfo.year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('出生年份无效'),

  body('birthInfo.month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('出生月份必须在1-12之间'),

  body('birthInfo.day')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('出生日期必须在1-31之间'),

  body('birthInfo.hour')
    .optional()
    .isInt({ min: 0, max: 23 })
    .withMessage('出生时辰必须在0-23之间'),

  body('birthInfo.lunar.year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('农历年份无效'),

  body('birthInfo.lunar.month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('农历月份必须在1-12之间'),

  body('birthInfo.lunar.day')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('农历日期必须在1-30之间'),

  body('birthInfo.lunar.isLeap')
    .optional()
    .isBoolean()
    .withMessage('闰月标识必须是布尔值'),

  body('birthInfo.timezone')
    .optional()
    .isString()
    .withMessage('时区必须是字符串')
];

/**
 * 更新偏好设置验证规则
 */
const validateUpdatePreferences = [
  body('preferences.language')
    .optional()
    .isIn(['zh-CN', 'zh-TW', 'en'])
    .withMessage('语言设置无效'),

  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('主题设置无效'),

  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('邮件通知设置必须是布尔值'),

  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('短信通知设置必须是布尔值'),

  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('推送通知设置必须是布尔值'),

  body('preferences.privacy.showProfile')
    .optional()
    .isBoolean()
    .withMessage('显示个人资料设置必须是布尔值'),

  body('preferences.privacy.showDivinationHistory')
    .optional()
    .isBoolean()
    .withMessage('显示占卜历史设置必须是布尔值')
];

/**
 * 修改密码验证规则
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('当前密码不能为空'),

  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('新密码长度必须在6-128个字符之间')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('新密码必须包含至少一个小写字母、一个大写字母和一个数字'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('确认密码与新密码不匹配');
      }
      return true;
    })
];

/**
 * 删除账户验证规则
 */
const validateDeleteAccount = [
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),

  body('confirmText')
    .equals('删除我的账户')
    .withMessage('确认文本不正确')
];

/**
 * 邮箱验证令牌验证规则
 */
const validateEmailVerificationToken = [
  param('token')
    .isLength({ min: 64, max: 64 })
    .withMessage('验证令牌格式不正确')
    .isHexadecimal()
    .withMessage('验证令牌必须是十六进制字符串')
];

/**
 * 分页查询验证规则
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),

  query('sort')
    .optional()
    .isString()
    .withMessage('排序字段必须是字符串'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('排序方向必须是asc或desc')
];

/**
 * 搜索查询验证规则
 */
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('搜索关键词长度必须在1-100个字符之间'),

  query('type')
    .optional()
    .isString()
    .withMessage('搜索类型必须是字符串')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateUpdateProfile,
  validateUpdateBirthInfo,
  validateUpdatePreferences,
  validateChangePassword,
  validateDeleteAccount,
  validateEmailVerificationToken,
  validatePagination,
  validateSearch
};
