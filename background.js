import { defaultEngines } from './common/defaultEngines.js';

// 首先声明 loadEnginesConfig 函数
async function loadEnginesConfig() {
  try {
    const result = await chrome.storage.sync.get('engines');
    return result.engines || [];
  } catch (error) {
    return [];
  }
}

// 添加初始化日志
console.log('Background script loaded');

// 从 popup.js 复制 loadEngines 方法
async function loadEngines() {
  try {
    const { engines } = await chrome.storage.sync.get('engines');
    console.log('engines from storage', engines);

    if (engines && engines.length > 0) {
      return engines;
    } else {
      return defaultEngines;
    }
  } catch (error) {
    console.error('Error loading engines:', error);
    return [];
  }
}

// 处理搜索请求
chrome.omnibox.onInputEntered.addListener(async (text) => {
  try {
    const engines = await loadEngines();
    console.log('All engines:', engines);
    
    const enabledEngines = engines.filter(engine => engine.enabled);
    console.log('Enabled engines:', enabledEngines);

    for (const engine of enabledEngines) {
      const searchUrl = engine.url.replace('%s', encodeURIComponent(text));
      
      try {
        await chrome.tabs.create({
          url: searchUrl,
          active: false
        });
      } catch (error) {
        console.error(`Error opening tab for ${engine.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Search error:', error);
  }
});

// 监听配置更新消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENGINES_UPDATED') {
    console.log('Received ENGINES_UPDATED message');
    loadEnginesConfig().then(() => {
      console.log('Engines config reloaded');
      sendResponse({ status: 'success' });
    });
    return true;
  }
});
  