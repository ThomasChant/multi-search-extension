console.log('Popup script starting...');

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

// 在 defaultEngines 后添加事件处理函数
function handleEngineSelect(select, urlInput, timeoutInput) {
  const selectedEngine = select.value;
  if (selectedEngine && selectedEngine !== 'custom') {
    const engine = defaultEngines[selectedEngine];
    urlInput.value = engine.url;
    timeoutInput.value = engine.timeout;
    urlInput.readOnly = true;
  } else {
    urlInput.value = '';
    timeoutInput.value = '10000';
    urlInput.readOnly = false;
  }
}

// 添加搜索引擎输入框
function addEngineInput(name = '', url = '', timeout = 10000, isCustom = false) {
  const container = document.getElementById('engineList');
  const div = document.createElement('div');
  div.className = 'engine-item';
  
  if (isCustom) {
    // 自定义搜索引擎的HTML结构 - 名称可编辑
    div.innerHTML = `
      <input type="text" class="engine-name" 
        style="width: 100px;
               height: 32px;
               padding: 0 8px;
               border: 1px solid #ddd;
               border-radius: 4px;
               box-sizing: border-box;"
        placeholder="搜索引擎名称" 
        value="${name}">
      <input type="text" class="engine-url" 
        placeholder="搜索URL (%s代表搜索词)" 
        value="${url}">
      <input type="number" class="engine-timeout" 
        placeholder="超时(毫秒)" 
        value="${timeout}">
      <button class="btn btn-danger">删除</button>
    `;
  } else {
    // 预设搜索引擎的HTML结构 - 名称不可编辑，URL可编辑
    div.innerHTML = `
      <div class="engine-name" 
        style="width: 100px;
               height: 32px;
               padding: 0 8px;
               line-height: 32px;
               border: 1px solid #ddd;
               border-radius: 4px;
               box-sizing: border-box;
               background: #f5f5f5;">${name}</div>
      <input type="text" class="engine-url" 
        placeholder="搜索URL (%s代表搜索词)" 
        value="${url}">
      <input type="number" class="engine-timeout" 
        placeholder="超时(毫秒)" 
        value="${timeout}">
      <button class="btn btn-danger">删除</button>
    `;
  }
  
  // 添加删除按钮事件
  div.querySelector('.btn-danger').addEventListener('click', () => {
    div.remove();
  });
  
  container.appendChild(div);
}

// 加载配置
function loadEngines() {
  chrome.storage.sync.get('searchEngines', (data) => {
    const container = document.getElementById('engineList');
    container.innerHTML = '';
    
    const engines = data.searchEngines || defaultEngines;
    
    // 首先加载预设搜索引擎
    Object.entries(defaultEngines).forEach(([name, defaultData]) => {
      const engineData = engines[name] || defaultData;
      addEngineInput(
        name,
        engineData.url,
        engineData.timeout,
        false  // 预设搜索引擎
      );
    });
    
    // 然后加载自定义搜索引擎
    Object.entries(engines).forEach(([name, engineData]) => {
      if (!defaultEngines[name]) {
        addEngineInput(
          name,
          engineData.url,
          engineData.timeout,
          true  // 自定义搜索引擎
        );
      }
    });
  });
}

// 保存配置
function saveEngines() {
  const engines = {};
  
  // 保存所有搜索引擎配置
  document.querySelectorAll('.engine-item').forEach(item => {
    const nameElement = item.querySelector('.engine-name');
    const url = item.querySelector('.engine-url').value;
    const timeout = parseInt(item.querySelector('.engine-timeout').value) || 10000;
    
    // 获取引擎名称
    let name;
    if (nameElement.tagName === 'DIV') {
      // 预设搜索引擎
      name = nameElement.textContent;
    } else {
      // 自定义搜索引擎
      name = nameElement.value.trim();
    }
    
    if (name && url) {
      engines[name] = { url, timeout };
    }
  });
  
  console.log('Saving engines:', engines);
  chrome.storage.sync.set({ searchEngines: engines }, () => {
    alert('设置已保存！');
  });
}

// 在文件开头添加
function initializeIntroSection() {
  const introHeader = document.getElementById('introHeader');
  const introContent = document.getElementById('introContent');
  const toggleIcon = introHeader.querySelector('.toggle-icon');
  
  // 默认设置为收起状态
  toggleIcon.style.transform = 'rotate(-90deg)';
  
  // 从存储中获取状态，但默认为 true（收起）
  chrome.storage.local.get('introCollapsed', (data) => {
    const isCollapsed = data.introCollapsed === undefined ? true : data.introCollapsed;
    if (!isCollapsed) {
      // 只有当明确设置为展开时才展开
      introContent.classList.remove('collapsed');
      toggleIcon.style.transform = '';
    }
  });
  
  introHeader.addEventListener('click', () => {
    const isCollapsed = introContent.classList.toggle('collapsed');
    toggleIcon.style.transform = isCollapsed ? 'rotate(-90deg)' : '';
    chrome.storage.local.set({ introCollapsed: isCollapsed });
  });
}

// 确保在 DOMContentLoaded 时初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded'); // 调试日志
  initializeIntroSection();
  // 加载已有配置
  loadEngines();
  
  // 添加按钮事件
  document.getElementById('addEngine').addEventListener('click', () => {
    addEngineInput('', '', 10000, true);  // 添加自定义搜索引擎
  });
  
  // 保存按钮事件
  document.getElementById('saveEngines').addEventListener('click', saveEngines);
}); 