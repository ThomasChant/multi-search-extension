// 默认搜索引擎配置
const defaultEngines = {
  "Google": {
    url: "https://www.google.com/search?q=%s",
    timeout: 10000
  },
  "百度": {
    url: "https://www.baidu.com/s?wd=%s",
    timeout: 10000
  },
  "必应": {
    url: "https://www.bing.com/search?q=%s",
    timeout: 10000
  },
  "搜狗": {
    url: "https://www.sogou.com/web?query=%s",
    timeout: 10000
  }
};

// 初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  chrome.storage.sync.set({ searchEngines: defaultEngines });
});

// 监听 omnibox 输入
chrome.omnibox.onInputEntered.addListener((text) => {
  console.log('Search text:', text);
  
  // 获取搜索引擎配置
  chrome.storage.sync.get('searchEngines', (data) => {
    console.log('Got stored engines:', data);
    
    // 使用存储的配置，如果没有则使用默认配置
    const engines = data.searchEngines || defaultEngines;
    console.log('Using engines:', engines);
    
    // 为每个搜索引擎创建标签页
    Object.entries(engines).forEach(([name, engineData]) => {
      console.log(`Creating search tab for ${name}:`, engineData);
      
      // 构建搜索URL
      const searchUrl = engineData.url.replace('%s', encodeURIComponent(text));
      console.log(`${name} search URL:`, searchUrl);
      
      // 创建标签页
      chrome.tabs.create({ url: searchUrl }, (tab) => {
        console.log(`Created tab for ${name}:`, tab.id);
        
        // 设置超时检查
        if (engineData.timeout > 0) {
          setTimeout(() => {
            chrome.tabs.get(tab.id, (tabInfo) => {
              if (tabInfo && tabInfo.status === 'loading') {
                chrome.tabs.remove(tab.id);
                console.log(`Closed slow loading tab for ${name}`);
              }
            });
          }, engineData.timeout);
        }
      });
    });
  });
});

// 添加默认建议
chrome.omnibox.onInputStarted.addListener(() => {
  chrome.storage.sync.get('searchEngines', (data) => {
    const engines = data.searchEngines || defaultEngines;
    const engineCount = Object.keys(engines).length;
    chrome.omnibox.setDefaultSuggestion({
      description: `在 ${engineCount} 个搜索引擎中搜索: %s`
    });
  });
});

// 输入变化时更新建议
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.storage.sync.get('searchEngines', (data) => {
    const engines = data.searchEngines || defaultEngines;
    const engineCount = Object.keys(engines).length;
    chrome.omnibox.setDefaultSuggestion({
      description: `在 ${engineCount} 个搜索引擎中搜索: ${text}`
    });
  });
});

// 输出调试信息
console.log('Background script loaded');
  