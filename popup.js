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
function addEngineInput(name = '', url = '', timeout = 10000, isCustom = false, enabled = true) {
  const container = document.getElementById('engineList');
  const div = document.createElement('div');
  div.className = `engine-item${enabled ? '' : ' disabled'}`;
  
  // 创建开关按钮的HTML
  const switchHtml = `
    <label class="switch">
      <input type="checkbox" class="engine-enabled" ${enabled ? 'checked' : ''}>
      <span class="slider"></span>
    </label>
  `;
  
  if (isCustom) {
    // 自定义搜索引擎的HTML结构
    div.innerHTML = `
      <input type="text" class="engine-name" 
        placeholder="搜索引擎名称" 
        value="${name}">
      <input type="text" class="engine-url" 
        placeholder="搜索URL (%s代表搜索词)" 
        value="${url}">
      <input type="number" class="engine-timeout" 
        placeholder="超时" 
        value="${timeout}">
      ${switchHtml}
      <button class="btn-delete" title="删除">
        <i class="bi bi-trash"></i>
      </button>
    `;
  } else {
    // 预设搜索引擎的HTML结构
    div.innerHTML = `
      <div class="engine-name">${name}</div>
      <input type="text" class="engine-url" 
        placeholder="搜索URL (%s代表搜索词)" 
        value="${url}">
      <input type="number" class="engine-timeout" 
        placeholder="超时" 
        value="${timeout}">
      ${switchHtml}
      <button class="btn-delete" title="删除">
        <i class="bi bi-trash"></i>
      </button>
    `;
  }
  
  // 添加开关事件监听
  const enabledSwitch = div.querySelector('.engine-enabled');
  enabledSwitch.addEventListener('change', () => {
    div.classList.toggle('disabled', !enabledSwitch.checked);
  });
  
  // 添加删除按钮事件
  div.querySelector('.btn-delete').addEventListener('click', () => {
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
        false,  // 预设搜索引擎
        engineData.enabled !== false  // 默认启用
      );
    });
    
    // 然后加载自定义搜索引擎
    Object.entries(engines).forEach(([name, engineData]) => {
      if (!defaultEngines[name]) {
        addEngineInput(
          name,
          engineData.url,
          engineData.timeout,
          true,  // 自定义搜索引擎
          engineData.enabled !== false  // 默认启用
        );
      }
    });
  });
}

// 添加显示提示的函数
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
  
  // 重置可能的淡出动画
  toast.style.animation = 'slideIn 0.3s ease-out';
  
  // 2秒后开始淡出
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out';
    
    // 动画结束后隐藏
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }, 2000);
}

// 修改保存配置的函数
function saveEngines() {
  const engines = {};
  
  document.querySelectorAll('.engine-item').forEach(item => {
    const nameElement = item.querySelector('.engine-name');
    const url = item.querySelector('.engine-url').value;
    const timeout = parseInt(item.querySelector('.engine-timeout').value) || 10000;
    const enabled = item.querySelector('.engine-enabled').checked;
    
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
      engines[name] = { url, timeout, enabled };
    }
  });
  
  console.log('Saving engines:', engines);
  chrome.storage.sync.set({ searchEngines: engines }, () => {
    showToast('设置已保存！');
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