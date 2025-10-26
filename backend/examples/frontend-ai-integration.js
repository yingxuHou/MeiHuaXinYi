/**
 * 前端AI占卜解读使用示例
 * 展示如何调用AI解读API
 */

class DivinationAIExample {
  constructor(baseURL, token) {
    this.baseURL = baseURL || 'http://localhost:3001/api';
    this.token = token;
  }

  /**
   * 执行占卜并获取AI解读
   */
  async performDivinationWithAI(question, method = '时间起卦') {
    try {
      const response = await fetch(`${this.baseURL}/divination/perform-with-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          question,
          method,
          params: {},
          aiOptions: {
            temperature: 0.7,
            maxTokens: 2000
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          divination: result.data,
          aiInterpretation: result.data.aiInterpretation
        };
      } else {
        throw new Error(result.message || '占卜失败');
      }
    } catch (error) {
      console.error('占卜失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 为现有占卜生成自定义解读
   */
  async generateCustomInterpretation(divinationId, customPrompt) {
    try {
      const response = await fetch(`${this.baseURL}/divination/${divinationId}/interpretation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          customPrompt,
          options: {
            temperature: 0.8,
            maxTokens: 1500
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          interpretation: result.data
        };
      } else {
        throw new Error(result.message || '生成解读失败');
      }
    } catch (error) {
      console.error('生成解读失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取解读模板
   */
  async getInterpretationTemplates() {
    try {
      const response = await fetch(`${this.baseURL}/divination/interpretation-templates`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          templates: result.data
        };
      } else {
        throw new Error(result.message || '获取模板失败');
      }
    } catch (error) {
      console.error('获取模板失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 检查AI服务状态
   */
  async checkAIStatus() {
    try {
      const response = await fetch(`${this.baseURL}/divination/ai-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          status: result.data
        };
      } else {
        throw new Error(result.message || '检查状态失败');
      }
    } catch (error) {
      console.error('检查状态失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 批量生成解读
   */
  async batchGenerateInterpretation(divinationIds, template) {
    try {
      const response = await fetch(`${this.baseURL}/divination/batch-interpretation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          divinationIds,
          template
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          results: result.data
        };
      } else {
        throw new Error(result.message || '批量生成失败');
      }
    } catch (error) {
      console.error('批量生成失败:', error);
      return { success: false, error: error.message };
    }
  }
}

// 使用示例
async function example() {
  const divinationAI = new DivinationAIExample('http://localhost:3001/api', 'your-jwt-token');

  // 1. 执行占卜并获取AI解读
  console.log('1. 执行占卜并获取AI解读:');
  const divinationResult = await divinationAI.performDivinationWithAI(
    '我想知道我的事业发展如何？',
    '时间起卦'
  );

  if (divinationResult.success) {
    console.log('占卜结果:', divinationResult.divination);
    console.log('AI解读:', divinationResult.aiInterpretation.content);
  }

  // 2. 获取解读模板
  console.log('\n2. 获取解读模板:');
  const templatesResult = await divinationAI.getInterpretationTemplates();
  if (templatesResult.success) {
    console.log('可用模板:', Object.keys(templatesResult.templates));
  }

  // 3. 生成自定义解读
  console.log('\n3. 生成自定义解读:');
  if (divinationResult.success && divinationResult.divination.id) {
    const customResult = await divinationAI.generateCustomInterpretation(
      divinationResult.divination.id,
      '请从职场发展的角度分析这个卦象，重点关注当前职业阶段特征和未来发展趋势。'
    );

    if (customResult.success) {
      console.log('自定义解读:', customResult.interpretation.content);
    }
  }

  // 4. 检查AI服务状态
  console.log('\n4. 检查AI服务状态:');
  const statusResult = await divinationAI.checkAIStatus();
  if (statusResult.success) {
    console.log('AI服务状态:', statusResult.status);
  }
}

// Vue.js 组件示例
const DivinationAIComponent = {
  template: `
    <div class="divination-ai">
      <h2>AI占卜解读</h2>
      
      <!-- 占卜输入 -->
      <div class="divination-input">
        <textarea 
          v-model="question" 
          placeholder="请输入您的占卜问题..."
          rows="3"
        ></textarea>
        <button @click="performDivination" :disabled="loading">
          {{ loading ? '占卜中...' : '开始占卜' }}
        </button>
      </div>

      <!-- 占卜结果 -->
      <div v-if="divinationResult" class="divination-result">
        <h3>占卜结果</h3>
        <div class="hexagram-info">
          <p>主卦：{{ divinationResult.hexagrams.ben.name }}</p>
          <p>变卦：{{ divinationResult.hexagrams.bian.name }}</p>
          <p>运势：{{ divinationResult.analysis.wuxing.fortune }}</p>
        </div>
      </div>

      <!-- AI解读 -->
      <div v-if="aiInterpretation" class="ai-interpretation">
        <h3>AI解读</h3>
        <div class="interpretation-content" v-html="formatInterpretation(aiInterpretation.content)"></div>
        
        <!-- 解读模板选择 -->
        <div class="template-selection">
          <h4>选择解读角度：</h4>
          <button 
            v-for="(template, key) in templates" 
            :key="key"
            @click="generateTemplateInterpretation(key)"
            :disabled="loadingInterpretation"
          >
            {{ template.name }}
          </button>
        </div>
      </div>

      <!-- 自定义解读 -->
      <div v-if="showCustomPrompt" class="custom-interpretation">
        <h4>自定义解读</h4>
        <textarea 
          v-model="customPrompt" 
          placeholder="请输入您的自定义解读要求..."
          rows="3"
        ></textarea>
        <button @click="generateCustomInterpretation" :disabled="loadingInterpretation">
          生成解读
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <p>AI正在为您解读，请稍候...</p>
      </div>
    </div>
  `,
  
  data() {
    return {
      question: '',
      divinationResult: null,
      aiInterpretation: null,
      templates: {},
      customPrompt: '',
      showCustomPrompt: false,
      loading: false,
      loadingInterpretation: false,
      divinationAI: null
    };
  },

  async mounted() {
    // 初始化API客户端
    this.divinationAI = new DivinationAIExample(
      'http://localhost:3001/api', 
      this.$store.state.auth.token
    );

    // 获取解读模板
    const templatesResult = await this.divinationAI.getInterpretationTemplates();
    if (templatesResult.success) {
      this.templates = templatesResult.templates;
    }
  },

  methods: {
    async performDivination() {
      if (!this.question.trim()) {
        alert('请输入占卜问题');
        return;
      }

      this.loading = true;
      
      try {
        const result = await this.divinationAI.performDivinationWithAI(
          this.question,
          '时间起卦'
        );

        if (result.success) {
          this.divinationResult = result.divination;
          this.aiInterpretation = result.aiInterpretation;
          this.showCustomPrompt = true;
        } else {
          alert('占卜失败：' + result.error);
        }
      } catch (error) {
        alert('占卜失败：' + error.message);
      } finally {
        this.loading = false;
      }
    },

    async generateTemplateInterpretation(templateKey) {
      if (!this.divinationResult) return;

      this.loadingInterpretation = true;

      try {
        const template = this.templates[templateKey];
        const result = await this.divinationAI.generateCustomInterpretation(
          this.divinationResult.id,
          template.prompt
        );

        if (result.success) {
          this.aiInterpretation = result.interpretation;
        } else {
          alert('生成解读失败：' + result.error);
        }
      } catch (error) {
        alert('生成解读失败：' + error.message);
      } finally {
        this.loadingInterpretation = false;
      }
    },

    async generateCustomInterpretation() {
      if (!this.customPrompt.trim()) {
        alert('请输入自定义解读要求');
        return;
      }

      this.loadingInterpretation = true;

      try {
        const result = await this.divinationAI.generateCustomInterpretation(
          this.divinationResult.id,
          this.customPrompt
        );

        if (result.success) {
          this.aiInterpretation = result.interpretation;
        } else {
          alert('生成解读失败：' + result.error);
        }
      } catch (error) {
        alert('生成解读失败：' + error.message);
      } finally {
        this.loadingInterpretation = false;
      }
    },

    formatInterpretation(content) {
      // 简单的格式化，将换行转换为HTML
      return content.replace(/\n/g, '<br>');
    }
  }
};

// 导出组件
export default DivinationAIComponent;
