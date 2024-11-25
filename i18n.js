/**
 * 国际化管理器
 * 负责处理语言切换、文本翻译和界面更新
 */
class I18nManager {
  constructor() {
    // 支持的语言列表
    this.supportedLocales = ['zh_CN', 'en'];
    
    // 获取浏览器语言
    const browserLang = chrome.i18n.getUILanguage();
    // 设置默认语言
    this.currentLocale = browserLang.startsWith('zh') ? 'zh_CN' : 'en';
    
    // 绑定方法到实例
    this.init = this.init.bind(this);
    this.setLocale = this.setLocale.bind(this);
    this.getMessage = this.getMessage.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.updateLanguageButtons = this.updateLanguageButtons.bind(this);
  }

  /**
   * 初始化国际化设置
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // 从存储中获取用户语言设置
      const { userLocale } = await chrome.storage.sync.get('userLocale');
      
      // 如果有有效的存储语言设置，则使用该设置
      if (userLocale && this.supportedLocales.includes(userLocale)) {
        this.currentLocale = userLocale;
      }

      // 初始化界面
      await this.updateUI();
      // 更新语言按钮状态
      this.updateLanguageButtons();
      
      // 添加语言切换按钮事件监听
      this.initLanguageButtons();
      
      console.log('I18n initialized:', this.currentLocale);
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
      throw error; // 向上传递错误
    }
  }

  /**
   * 初始化语言切换按钮
   */
  initLanguageButtons() {
    try {
      document.querySelectorAll('.language-btn').forEach(btn => {
        btn.addEventListener('click', async (event) => {
          const newLocale = event.target.getAttribute('data-locale');
          await this.setLocale(newLocale);
        });
      });
    } catch (error) {
      console.error('Failed to initialize language buttons:', error);
    }
  }

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键值
   * @param {string|string[]|null} substitutions - 替换参数
   * @returns {string} 翻译后的文本
   */
  getMessage(key, substitutions = null) {
    try {
      const message = chrome.i18n.getMessage(key, substitutions);
      if (!message) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
      return message;
    } catch (error) {
      console.error(`Error getting message for key ${key}:`, error);
      return key;
    }
  }

  /**
   * 设置当前语言
   * @param {string} locale - 目标语言代码
   * @returns {Promise<void>}
   */
  async setLocale(locale) {
    try {
      // 检查语言是否支持
      if (!this.supportedLocales.includes(locale)) {
        throw new Error(`Unsupported locale: ${locale}`);
      }

      // 更新当前语言
      this.currentLocale = locale;
      
      // 保存语言设置
      await chrome.storage.sync.set({ userLocale: locale });
      
      // 更新界面
      await this.updateUI();
      
      // 更新语言按钮状态
      this.updateLanguageButtons();
      
      // 重新加载搜索引擎列表
      await this.reloadEngineList();
      
      console.log('Language changed to:', locale);
    } catch (error) {
      console.error('Failed to set locale:', error);
      throw error;
    }
  }

  /**
   * 更新界面文本
   * @returns {Promise<void>}
   */
  async updateUI() {
    try {
      // 更新标题
      document.title = this.getMessage('extensionTitle');
      
      // 更新所有带有 data-i18n 属性的元素
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // 根据元素类型设置翻译文本
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = this.getMessage(key);
        } else {
          element.textContent = this.getMessage(key);
        }
      });

      // 更新所有搜索引擎名称
      document.querySelectorAll('[data-engine-key]').forEach(element => {
        const key = element.getAttribute('data-engine-key');
        element.textContent = this.getMessage(key);
      });
    } catch (error) {
      console.error('Failed to update UI:', error);
      throw error;
    }
  }

  /**
   * 更新语言切换按钮状态
   */
  updateLanguageButtons() {
    try {
      document.querySelectorAll('.language-btn').forEach(btn => {
        const btnLocale = btn.getAttribute('data-locale');
        btn.classList.toggle('active', btnLocale === this.currentLocale);
      });
    } catch (error) {
      console.error('Failed to update language buttons:', error);
    }
  }

  /**
   * 重新加载搜索引擎列表
   * @returns {Promise<void>}
   */
  async reloadEngineList() {
    try {
      const engineList = document.getElementById('engineList');
      if (!engineList) {
        throw new Error('Engine list container not found');
      }

      // 清空现有列表
      engineList.innerHTML = '';
      
      // 重新加载搜索引擎
      if (typeof window.loadEngines === 'function') {
        await window.loadEngines();
      } else {
        throw new Error('loadEngines function not found');
      }
    } catch (error) {
      console.error('Failed to reload engine list:', error);
      throw error;
    }
  }
}

// 创建单例实例
const i18n = new I18nManager();

// 导出实例
window.i18n = i18n;
export default i18n; 