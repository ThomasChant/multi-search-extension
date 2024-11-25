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
  try {
    const container = document.getElementById('engineList');
    if (!container) {
      throw new Error('Engine list container not found');
    }

    const div = document.createElement('div');
    div.className = `engine-item${enabled ? '' : ' disabled'}`;
    
    // 使用内联SVG作为删除按钮图标
    const deleteButton = `
      <button class="delete-btn" title="${window.i18n.getMessage('delete')}">
        <svg class="delete-icon" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1H11zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
        </svg>
      </button>
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
        ${deleteButton}
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
        ${deleteButton}
      `;
    }
    
    // 添加开关事件监听
    const enabledSwitch = div.querySelector('.engine-enabled');
    enabledSwitch.addEventListener('change', () => {
      div.classList.toggle('disabled', !enabledSwitch.checked);
    });
    
    // 添加删除按钮事件
    div.querySelector('.delete-btn').addEventListener('click', () => {
      div.remove();
    });
    
    container.appendChild(div);
  } catch (error) {
    console.error('Error adding engine input:', error);
  }
}

// 加载配置
async function loadEngines() {
  try {
    const { engines } = await chrome.storage.sync.get('engines');
    const container = document.getElementById('engineList');
    
    if (!container) {
      throw new Error('Engine list container not found');
    }

    // 清空现有列表
    container.innerHTML = '';

    if (engines && engines.length > 0) {
      // 加载保存的搜索引擎
      engines.forEach(engine => {
        addEngineInput(
          engine.name,
          engine.url,
          engine.timeout || 10000,
          engine.isCustom || false,
          engine.enabled !== false
        );
      });
    } else {
      // 加载默认搜索引擎
      const defaultEngines = [
        { name: 'google', url: 'https://www.google.com/search?q=%s' },
        { name: 'baidu', url: 'https://www.baidu.com/s?wd=%s' },
        { name: 'bing', url: 'https://www.bing.com/search?q=%s' },
        { name: 'sogou', url: 'https://www.sogou.com/web?query=%s' }
      ];

      defaultEngines.forEach(engine => {
        addEngineInput(
          engine.name,
          engine.url,
          10000,
          false,
          true
        );
      });
    }
  } catch (error) {
    console.error('Error loading engines:', error);
    showToast(window.i18n.getMessage('errorLoading'));
  }
}

// 添加显示提示的函数
function showToast(message, type = 'info') {
  try {
    const toast = document.getElementById('toast');
    if (!toast) {
      throw new Error('Toast element not found');
    }

    // 添加不同类型的提示样式
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.display = 'block';

    // 自动隐藏
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  } catch (error) {
    console.error('Error showing toast:', error);
  }
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