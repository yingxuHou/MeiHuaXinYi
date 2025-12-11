/**
 * 梅花心易 - 一键启动开发环境脚本
 * 同时启动前端和后端服务
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (color, prefix, message) => {
  console.log(`${colors[color]}[${prefix}]${colors.reset} ${message}`);
};

// 检查目录是否存在
const checkDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    log('red', 'ERROR', `目录不存在: ${dir}`);
    return false;
  }
  return true;
};

// 检查package.json是否存在
const checkPackageJson = (dir) => {
  const packagePath = path.join(dir, 'package.json');
  if (!fs.existsSync(packagePath)) {
    log('red', 'ERROR', `package.json不存在: ${packagePath}`);
    return false;
  }
  return true;
};

// 启动进程
const startProcess = (name, command, args, cwd, color) => {
  return new Promise((resolve, reject) => {
    log(color, name, `启动中... (${command} ${args.join(' ')})`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });

    let isStarted = false;
    let startupTimeout;

    // 设置启动超时
    startupTimeout = setTimeout(() => {
      if (!isStarted) {
        log('yellow', name, '启动超时，但进程可能仍在运行...');
        resolve(process);
      }
    }, 30000); // 30秒超时

    process.stdout.on('data', (data) => {
      const output = data.toString();
      
      // 输出日志（添加前缀）
      output.split('\n').forEach(line => {
        if (line.trim()) {
          log(color, name, line.trim());
        }
      });

      // 检查启动成功的标志
      if (!isStarted) {
        const successPatterns = [
          /server.*running.*port/i,
          /local.*http/i,
          /ready.*in/i,
          /listening.*on/i,
          /dev.*server.*running/i,
          /✅.*服务器启动成功/i
        ];

        if (successPatterns.some(pattern => pattern.test(output))) {
          isStarted = true;
          clearTimeout(startupTimeout);
          log('green', name, '启动成功！');
          resolve(process);
        }
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString();
      
      // 过滤掉一些常见的警告
      const ignoredPatterns = [
        /warning/i,
        /deprecated/i,
        /experimental/i,
        /缺少推荐的环境变量/i
      ];

      if (!ignoredPatterns.some(pattern => pattern.test(output))) {
        output.split('\n').forEach(line => {
          if (line.trim()) {
            log('red', name, line.trim());
          }
        });
      }
    });

    process.on('error', (error) => {
      clearTimeout(startupTimeout);
      log('red', name, `启动失败: ${error.message}`);
      reject(error);
    });

    process.on('exit', (code) => {
      clearTimeout(startupTimeout);
      if (code !== 0) {
        log('red', name, `进程退出，代码: ${code}`);
      }
    });
  });
};

// 主函数
async function startDevelopment() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('🌟 梅花心易 - 开发环境启动器');
  console.log('=' .repeat(50));
  console.log(`${colors.reset}`);

  const backendDir = path.join(__dirname, 'backend');
  const frontendDir = path.join(__dirname, 'frontend');

  // 检查目录结构
  log('blue', 'CHECK', '检查项目结构...');
  
  if (!checkDirectory(backendDir) || !checkDirectory(frontendDir)) {
    log('red', 'ERROR', '项目结构不完整，请确保backend和frontend目录存在');
    process.exit(1);
  }

  if (!checkPackageJson(backendDir) || !checkPackageJson(frontendDir)) {
    log('red', 'ERROR', '缺少package.json文件');
    process.exit(1);
  }

  log('green', 'CHECK', '项目结构检查通过');

  // 启动后端
  log('blue', 'SETUP', '启动后端服务...');
  let backendProcess;
  try {
    backendProcess = await startProcess(
      'BACKEND',
      'npm',
      ['run', 'dev'],
      backendDir,
      'magenta'
    );
  } catch (error) {
    log('red', 'ERROR', '后端启动失败');
    process.exit(1);
  }

  // 等待一下让后端完全启动
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 启动前端
  log('blue', 'SETUP', '启动前端服务...');
  let frontendProcess;
  try {
    frontendProcess = await startProcess(
      'FRONTEND',
      'npm',
      ['run', 'dev'],
      frontendDir,
      'cyan'
    );
  } catch (error) {
    log('red', 'ERROR', '前端启动失败');
    if (backendProcess) {
      backendProcess.kill();
    }
    process.exit(1);
  }

  // 启动完成
  console.log(`\n${colors.bright}${colors.green}`);
  console.log('🎉 开发环境启动完成！');
  console.log('=' .repeat(50));
  console.log('📱 前端地址: http://localhost:5173');
  console.log('🔧 后端地址: http://localhost:8080');
  console.log('💚 健康检查: http://localhost:8080/api/health');
  console.log('📚 API文档: http://localhost:8080/api');
  console.log('=' .repeat(50));
  console.log('💡 提示:');
  console.log('   - 按 Ctrl+C 停止所有服务');
  console.log('   - 修改代码会自动重新加载');
  console.log('   - 查看控制台输出了解运行状态');
  console.log('   - 生产环境: npm run build && npm run start');
  console.log(`${colors.reset}\n`);

  // 处理退出信号
  const cleanup = () => {
    log('yellow', 'CLEANUP', '正在关闭服务...');
    
    if (backendProcess) {
      backendProcess.kill('SIGTERM');
    }
    
    if (frontendProcess) {
      frontendProcess.kill('SIGTERM');
    }
    
    setTimeout(() => {
      log('green', 'CLEANUP', '所有服务已关闭');
      process.exit(0);
    }, 2000);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  // 保持进程运行
  process.stdin.resume();
}

// 错误处理
process.on('uncaughtException', (error) => {
  log('red', 'ERROR', `未捕获的异常: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('red', 'ERROR', `未处理的Promise拒绝: ${reason}`);
  process.exit(1);
});

// 启动
if (require.main === module) {
  startDevelopment().catch(error => {
    log('red', 'ERROR', `启动失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { startDevelopment };
