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
  
  chrome.storage.sync.get('searchEngines', (data) => {
    console.log('Got stored engines:', data);
    
    const engines = data.searchEngines || defaultEngines;
    
    // 只使用启用的搜索引擎
    Object.entries(engines).forEach(([name, engineData]) => {
      if (engineData.enabled !== false) {  // 如果搜索引擎未被禁用
        console.log(`Creating search tab for ${name}:`, engineData);
        
        const searchUrl = engineData.url.replace('%s', encodeURIComponent(text));
        
        chrome.tabs.create({ url: searchUrl }, (tab) => {
          console.log(`Created tab for ${name}:`, tab.id);
          
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
      }
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ENGINES_UPDATED') {
    // 重新加载搜索引擎配置
    loadEnginesConfig();
    sendResponse({status: 'success'});
  }
  return true; // 保持消息通道开放
});
  