/**
 * Windows系统验证脚本
 * 适用于Windows PowerShell环境
 */

const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

require('dotenv').config({ path: path.join(__dirname, '../.env') });

class WindowsValidator {
  constructor() {
    this.results = {
      environment: false,
      mongodb: false,
      connection: false,
      models: false
    };
  }

  async runValidation() {
    console.log('🚀 Windows系统验证开始...\n');

    try {
      await this.validateEnvironment();
      await this.validateMongoDB();
      await this.validateConnection();
      await this.validateModels();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ 验证过程出错:', error.message);
    }
  }

  async validateEnvironment() {
    console.log('🔧 1. 环境验证...');
    
    try {
      // 检查Node.js版本
      const nodeVersion = process.version;
      console.log(`   Node.js版本: ${nodeVersion}`);
      
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion >= 16) {
        console.log('   ✅ Node.js版本符合要求');
      } else {
        console.log('   ❌ Node.js版本过低，需要16+');
        return;
      }

      // 检查环境变量
      const requiredVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
      let allPresent = true;
      
      console.log('   环境变量检查:');
      requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
          console.log(`   ✅ ${varName}: ${varName.includes('SECRET') ? '***' : value}`);
        } else {
          console.log(`   ❌ ${varName}: 未设置`);
          allPresent = false;
        }
      });

      // 检查依赖包
      const dependencies = ['mongoose', 'express', 'dotenv', 'bcryptjs'];
      console.log('   依赖包检查:');
      
      for (const dep of dependencies) {
        try {
          require(dep);
          console.log(`   ✅ ${dep}: 已安装`);
        } catch (error) {
          console.log(`   ❌ ${dep}: 未安装`);
          allPresent = false;
        }
      }

      this.results.environment = allPresent;
      
    } catch (error) {
      console.error('   ❌ 环境验证失败:', error.message);
    }
    
    console.log('');
  }

  async validateMongoDB() {
    console.log('🗄️ 2. MongoDB服务验证...');
    
    try {
      // 检查MongoDB服务状态
      console.log('   检查MongoDB服务状态...');
      
      try {
        const { stdout } = await execAsync('sc query MongoDB');
        if (stdout.includes('RUNNING')) {
          console.log('   ✅ MongoDB服务正在运行');
          this.results.mongodb = true;
        } else {
          console.log('   ⚠️ MongoDB服务未运行');
          console.log('   💡 尝试启动服务: net start MongoDB');
        }
      } catch (error) {
        console.log('   ⚠️ 无法检查MongoDB服务状态');
        console.log('   💡 可能MongoDB未安装或未配置为服务');
        
        // 检查MongoDB进程
        try {
          const { stdout } = await execAsync('tasklist | findstr mongod');
          if (stdout.trim()) {
            console.log('   ✅ 发现MongoDB进程正在运行');
            this.results.mongodb = true;
          } else {
            console.log('   ❌ 未发现MongoDB进程');
          }
        } catch (processError) {
          console.log('   ❌ 未发现MongoDB进程');
        }
      }

      // 检查MongoDB安装
      try {
        const { stdout } = await execAsync('where mongosh');
        console.log('   ✅ mongosh已安装:', stdout.trim());
      } catch (error) {
        try {
          const { stdout } = await execAsync('where mongo');
          console.log('   ✅ mongo已安装:', stdout.trim());
        } catch (error2) {
          console.log('   ⚠️ MongoDB客户端未找到');
          console.log('   💡 建议安装MongoDB Community Server');
        }
      }

    } catch (error) {
      console.error('   ❌ MongoDB验证失败:', error.message);
    }
    
    console.log('');
  }

  async validateConnection() {
    console.log('🔗 3. 数据库连接验证...');
    
    try {
      const mongoose = require('mongoose');
      
      console.log('   尝试连接数据库...');
      console.log(`   连接字符串: ${process.env.MONGODB_URI}`);
      
      // 设置连接超时
      const connectionOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        bufferCommands: false
      };

      await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
      
      console.log('   ✅ 数据库连接成功');
      console.log(`   📊 数据库名称: ${mongoose.connection.name}`);
      console.log(`   🏠 主机: ${mongoose.connection.host}`);
      console.log(`   🔌 端口: ${mongoose.connection.port}`);
      
      // 测试ping
      const pingResult = await mongoose.connection.db.admin().ping();
      if (pingResult.ok === 1) {
        console.log('   🏓 Ping测试: 成功');
        this.results.connection = true;
      }

      await mongoose.disconnect();
      console.log('   👋 连接已关闭');
      
    } catch (error) {
      console.error('   ❌ 数据库连接失败:', error.message);
      
      if (error.name === 'MongoNetworkError') {
        console.log('   💡 建议: 检查MongoDB服务是否启动');
        console.log('   💡 命令: net start MongoDB');
      } else if (error.name === 'MongoServerSelectionError') {
        console.log('   💡 建议: 检查连接字符串是否正确');
        console.log('   💡 当前: ' + process.env.MONGODB_URI);
      }
    }
    
    console.log('');
  }

  async validateModels() {
    console.log('📋 4. 数据模型验证...');
    
    try {
      const models = ['User', 'Divination', 'Conversation', 'KnowledgeBase'];
      
      for (const modelName of models) {
        try {
          const Model = require(`../src/models/${modelName}`);
          console.log(`   ✅ ${modelName}: 加载成功`);
          console.log(`      集合名: ${Model.collection.name}`);
          console.log(`      字段数: ${Object.keys(Model.schema.paths).length}`);
        } catch (error) {
          console.log(`   ❌ ${modelName}: 加载失败 - ${error.message}`);
        }
      }
      
      this.results.models = true;
      
    } catch (error) {
      console.error('   ❌ 模型验证失败:', error.message);
    }
    
    console.log('');
  }

  generateReport() {
    console.log('📊 验证报告:');
    console.log('='.repeat(50));
    
    const tests = [
      { name: '环境配置', result: this.results.environment },
      { name: 'MongoDB服务', result: this.results.mongodb },
      { name: '数据库连接', result: this.results.connection },
      { name: '数据模型', result: this.results.models }
    ];
    
    tests.forEach(test => {
      const status = test.result ? '✅ 通过' : '❌ 失败';
      console.log(`   ${test.name}: ${status}`);
    });
    
    const passedTests = tests.filter(test => test.result).length;
    const totalTests = tests.length;
    
    console.log('='.repeat(50));
    console.log(`总体结果: ${passedTests}/${totalTests} 测试通过`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有验证通过！可以继续开发。');
    } else {
      console.log('⚠️ 部分验证失败，请根据上述建议解决问题。');
      
      if (!this.results.mongodb) {
        console.log('\n💡 MongoDB问题解决方案:');
        console.log('1. 安装MongoDB Community Server');
        console.log('2. 或使用MongoDB Atlas云数据库');
        console.log('3. 确保服务正在运行: net start MongoDB');
      }
    }
  }
}

// 运行验证
if (require.main === module) {
  const validator = new WindowsValidator();
  validator.runValidation();
}

module.exports = WindowsValidator;
