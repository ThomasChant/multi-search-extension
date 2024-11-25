/**
 * 国际化管理器
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
      
      console.log('I18n initialized:', this.currentLocale);
    } catch (error) {
      console.error('Failed to initialize i18n:', error);
      throw error; // 向上传递错误
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
}

// 创建全局实例
window.i18n = new I18nManager(); 