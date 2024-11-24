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

// 当用户在地址栏输入 "ms" 后，显示默认建议
chrome.omnibox.onInputStarted.addListener(() => {
  chrome.omnibox.setDefaultSuggestion({
    description: chrome.i18n.getMessage('omniboxDescription')
  });
});

// 当用户在输入时提供建议
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  console.log('Input changed:', text);
  chrome.omnibox.setDefaultSuggestion({
    description: `在多个搜索引擎中搜索: ${text}`
  });
});

// 当用户按下回车时执行搜索
chrome.omnibox.onInputEntered.addListener((text) => {
  console.log('Search triggered with:', text);
  
  if (!text.trim()) {
    console.log('Empty search text');
    return;
  }

  // 获取存储的搜索引擎配置
  chrome.storage.sync.get('searchEngines', (data) => {
    const engines = data.searchEngines || defaultEngines;
    console.log('Using engines:', engines);

    // 为每个搜索引擎创建新标签页
    Object.entries(engines).forEach(([engineName, engineData]) => {
      const searchUrl = engineData.url.replace('%s', encodeURIComponent(text));
      console.log(`Creating tab for ${engineName}:`, searchUrl);

      // 创建新标签页
      chrome.tabs.create({ 
        url: searchUrl,
        active: false // 创建后不自动切换到新标签页
      }).then(tab => {
        console.log(`Tab created for ${engineName}:`, tab.id);
        
        // 设置超时检查
        setTimeout(() => {
          chrome.tabs.get(tab.id).then(currentTab => {
            if (currentTab && currentTab.status === 'loading') {
              chrome.tabs.remove(tab.id);
              console.log(`${engineName} search timed out, tab closed`);
            }
          }).catch(err => {
            console.log('Tab check error:', err);
          });
        }, engineData.timeout);
      }).catch(err => {
        console.error(`Error creating tab for ${engineName}:`, err);
      });
    });
  });
}); 