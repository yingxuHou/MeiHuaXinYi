/**
 * 梅花心易 - 邮箱服务
 * 处理邮箱验证码发送和验证
 */

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const config = require('../config');

/**
 * 邮箱服务类
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * 初始化邮件传输器
   */
  initializeTransporter() {
    try {
      // 开发环境使用控制台输出
      if (config.app.env === 'development') {
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });
        console.log('📧 邮箱服务已初始化（开发模式 - 控制台输出）');
      } else {
        // 生产环境使用真实邮箱服务
        this.transporter = nodemailer.createTransport({
          service: config.email?.service || 'gmail',
          auth: {
            user: config.email?.user,
            pass: config.email?.pass
          }
        });
        console.log('📧 邮箱服务已初始化（生产模式）');
      }
    } catch (error) {
      console.error('❌ 邮箱服务初始化失败:', error.message);
      this.transporter = null;
    }
  }

  /**
   * 生成验证码
   * @param {number} length - 验证码长度
   * @returns {string} 验证码
   */
  generateVerificationCode(length = 6) {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * digits.length)];
    }
    return code;
  }

  /**
   * 生成验证令牌
   * @returns {string} 验证令牌
   */
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 发送验证码邮件
   * @param {string} email - 收件人邮箱
   * @param {string} code - 验证码
   * @param {string} type - 验证类型 (register|login|reset)
   * @returns {Promise<boolean>} 发送结果
   */
  async sendVerificationCode(email, code, type = 'register') {
    try {
      if (!this.transporter) {
        throw new Error('邮箱服务未初始化');
      }

      const emailConfig = this.getEmailConfig(type, code);
      
      const mailOptions = {
        from: config.email?.from || 'noreply@meihuaxinyi.com',
        to: email,
        subject: emailConfig.subject,
        html: emailConfig.html,
        text: emailConfig.text
      };

      if (config.app.env === 'development') {
        // 开发环境：输出到控制台
        console.log('\n📧 邮件发送（开发模式）:');
        console.log('='.repeat(50));
        console.log(`收件人: ${email}`);
        console.log(`主题: ${emailConfig.subject}`);
        console.log(`验证码: ${code}`);
        console.log('='.repeat(50));
        
        // 模拟发送成功
        return true;
      } else {
        // 生产环境：真实发送
        const info = await this.transporter.sendMail(mailOptions);
        console.log('📧 验证码邮件发送成功:', info.messageId);
        return true;
      }
    } catch (error) {
      console.error('❌ 发送验证码邮件失败:', error.message);
      return false;
    }
  }

  /**
   * 发送验证链接邮件
   * @param {string} email - 收件人邮箱
   * @param {string} token - 验证令牌
   * @param {string} type - 验证类型
   * @returns {Promise<boolean>} 发送结果
   */
  async sendVerificationLink(email, token, type = 'register') {
    try {
      if (!this.transporter) {
        throw new Error('邮箱服务未初始化');
      }

      const verificationUrl = `${config.app.frontendUrl}/verify-email?token=${token}`;
      const emailConfig = this.getLinkEmailConfig(type, verificationUrl);
      
      const mailOptions = {
        from: config.email?.from || 'noreply@meihuaxinyi.com',
        to: email,
        subject: emailConfig.subject,
        html: emailConfig.html,
        text: emailConfig.text
      };

      if (config.app.env === 'development') {
        // 开发环境：输出到控制台
        console.log('\n📧 验证链接邮件发送（开发模式）:');
        console.log('='.repeat(50));
        console.log(`收件人: ${email}`);
        console.log(`主题: ${emailConfig.subject}`);
        console.log(`验证链接: ${verificationUrl}`);
        console.log('='.repeat(50));
        
        return true;
      } else {
        // 生产环境：真实发送
        const info = await this.transporter.sendMail(mailOptions);
        console.log('📧 验证链接邮件发送成功:', info.messageId);
        return true;
      }
    } catch (error) {
      console.error('❌ 发送验证链接邮件失败:', error.message);
      return false;
    }
  }

  /**
   * 获取邮件配置
   * @param {string} type - 邮件类型
   * @param {string} code - 验证码
   * @returns {Object} 邮件配置
   */
  getEmailConfig(type, code) {
    const configs = {
      register: {
        subject: '【梅花心易】欢迎注册，请验证您的邮箱',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">欢迎注册梅花心易</h2>
            <p>您好！感谢您注册梅花心易占卜系统。</p>
            <p>您的验证码是：</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px;">${code}</span>
            </div>
            <p>验证码有效期为10分钟，请及时使用。</p>
            <p>如果这不是您的操作，请忽略此邮件。</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `,
        text: `欢迎注册梅花心易！您的验证码是：${code}，有效期为10分钟。`
      },
      login: {
        subject: '【梅花心易】登录验证码',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">登录验证</h2>
            <p>您正在登录梅花心易系统。</p>
            <p>您的验证码是：</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px;">${code}</span>
            </div>
            <p>验证码有效期为5分钟，请及时使用。</p>
            <p>如果这不是您的操作，请立即修改密码。</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `,
        text: `您的登录验证码是：${code}，有效期为5分钟。`
      },
      reset: {
        subject: '【梅花心易】密码重置验证码',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">密码重置</h2>
            <p>您正在重置梅花心易账户密码。</p>
            <p>您的验证码是：</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #e74c3c; letter-spacing: 5px;">${code}</span>
            </div>
            <p>验证码有效期为15分钟，请及时使用。</p>
            <p>如果这不是您的操作，请立即联系客服。</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `,
        text: `您的密码重置验证码是：${code}，有效期为15分钟。`
      }
    };

    return configs[type] || configs.register;
  }

  /**
   * 获取验证链接邮件配置
   * @param {string} type - 邮件类型
   * @param {string} url - 验证链接
   * @returns {Object} 邮件配置
   */
  getLinkEmailConfig(type, url) {
    const configs = {
      register: {
        subject: '【梅花心易】请验证您的邮箱',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">欢迎注册梅花心易</h2>
            <p>您好！感谢您注册梅花心易占卜系统。</p>
            <p>请点击下面的链接验证您的邮箱：</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">验证邮箱</a>
            </div>
            <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
            <p style="word-break: break-all; color: #7f8c8d;">${url}</p>
            <p>链接有效期为24小时，请及时验证。</p>
            <p>如果这不是您的操作，请忽略此邮件。</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `,
        text: `欢迎注册梅花心易！请访问以下链接验证您的邮箱：${url}`
      }
    };

    return configs[type] || configs.register;
  }

  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 测试邮箱服务连接
   * @returns {Promise<boolean>} 连接结果
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        return false;
      }

      if (config.app.env === 'development') {
        console.log('📧 邮箱服务连接测试（开发模式）: 成功');
        return true;
      } else {
        await this.transporter.verify();
        console.log('📧 邮箱服务连接测试: 成功');
        return true;
      }
    } catch (error) {
      console.error('❌ 邮箱服务连接测试失败:', error.message);
      return false;
    }
  }
}

// 创建单例实例
const emailService = new EmailService();

module.exports = emailService;
