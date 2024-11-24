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
    console.log('Got engines data:', data);
    const engines = data.searchEngines || defaultEngines;
    
    // 为每个搜索引擎创建标签页
    Object.entries(engines).forEach(([name, engineData]) => {
      console.log(`Processing engine: ${name}`, engineData);
      
      // 构建搜索 URL
      const searchUrl = engineData.url.replace('%s', encodeURIComponent(text));
      console.log('Search URL:', searchUrl);
      
      // 创建新标签页
      chrome.tabs.create({ url: searchUrl }, (tab) => {
        console.log(`Created tab for ${name}:`, tab.id);
        
        // 设置超时关闭
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
  chrome.omnibox.setDefaultSuggestion({
    description: '在所有搜索引擎中搜索: %s'
  });
});

// 输入变化时更新建议
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.omnibox.setDefaultSuggestion({
    description: `在所有搜索引擎中搜索: ${text}`
  });
});

// 添加调试日志
console.log('Background script loaded');
  