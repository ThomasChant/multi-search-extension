console.log('Popup script starting...');

// 等待 DOM 和 i18n 加载完成
let i18nInitialized = false;

async function initializeApp() {
  try {
    if (!window.i18n) {
      throw new Error('i18n not found');
    }
    
    // 初始化 i18n
    await window.i18n.init();
    i18nInitialized = true;
    
    // 初始化折叠面板
    initializeCollapsibles();
    
    // 加载搜索引擎
    await loadEngines();
    
    // 初始化事件监听
    initializeEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('初始化失败', 'error');
  }
}

// 初始化事件监听
function initializeEventListeners() {
  // 添加搜索引擎按钮
  const addEngineBtn = document.getElementById('addEngine');
  if (addEngineBtn) {
    addEngineBtn.addEventListener('click', () => {
      addEngineInput('', '', 10000, true, true);
    });
  }

  // 保存设置按钮
  const saveEnginesBtn = document.getElementById('saveEngines');
  if (saveEnginesBtn) {
    saveEnginesBtn.addEventListener('click', saveEngines);
  }

  // 添加错处理
  if (!addEngineBtn || !saveEnginesBtn) {
    console.error('Required buttons not found');
    showToast('初始化按钮失败', 'error');
  }
}

// 加载搜索引擎
async function loadEngines() {
  try {
    if (!i18nInitialized) {
      throw new Error('i18n not initialized');
    }

    const { engines } = await chrome.storage.sync.get('engines');
    const container = document.getElementById('engineList');
    
    if (!container) {
      throw new Error('Engine list container not found');
    }

    // 清空现有列表
    container.innerHTML = '';

    if (engines && engines.length > 0) {
      engines.forEach(engine => addEngineInput(
        engine.name,
        engine.url,
        engine.timeout || 10000,
        engine.isCustom || false,
        engine.enabled !== false
      ));
    } else {
      getDefaultEngines().forEach(engine => addEngineInput(
        engine.name,
        engine.url,
        10000,
        false,
        true
      ));
    }
  } catch (error) {
    console.error('Error loading engines:', error);
    showToast('加载搜索引擎失败', 'error');
  }
}

// 添加搜索引擎输入
function addEngineInput(name = '', url = '', timeout = 10000, isCustom = false, enabled = true) {
  try {
    if (!i18nInitialized) {
      throw new Error('i18n not initialized');
    }

    const container = document.getElementById('engineList');
    if (!container) {
      throw new Error('Engine list container not found');
    }

    const item = document.createElement('div');
    item.className = 'engine-item';
    
    if (isCustom) {
        // 如果是自定义输入框
        const nameInputElement = document.createElement('input');
        nameInputElement.type = 'text';
        nameInputElement.className = 'engine-name';
        nameInputElement.value = name;
        nameInputElement.style.cssText = `
            width: 100px;
            height: 24px;
            line-height: 24px;
            text-align: left;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin: 0;
            padding: 0 5px;
            box-sizing: border-box;
            vertical-align: middle;
        `;
        item.appendChild(nameInputElement);
    } else {
        // 如果是固定的搜索引擎名称
        const nameSpan = document.createElement('span');
        nameSpan.className = 'engine-name';
        nameSpan.textContent = name;
        nameSpan.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: flex-start;
            width: 100px;
            height: 24px;
            line-height: 24px;
            text-align: left;
            background-color: #f0f0f0;
            color: #666;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin: 0;
            padding: 0 5px;
            box-sizing: border-box;
        `;
        item.appendChild(nameSpan);
    }
    
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.className = 'engine-url';
    urlInput.value = url;
    urlInput.placeholder = window.i18n.getMessage('searchUrl');

    const timeoutInput = document.createElement('input');
    timeoutInput.type = 'number';
    timeoutInput.className = 'engine-timeout';
    timeoutInput.value = timeout;
    timeoutInput.placeholder = window.i18n.getMessage('timeout');

    item.appendChild(urlInput);
    item.appendChild(timeoutInput);
    item.appendChild(createEnabledSwitch(enabled));
    item.appendChild(createDeleteButton());

    container.appendChild(item);
  } catch (error) {
    console.error('Error adding engine input:', error);
    showToast('添加搜索引擎失败', 'error');
  }
}

// 辅助函数
function createNameSpan(name) {
  const span = document.createElement('span');
  span.className = 'engine-name';
  span.setAttribute('data-engine-key', name);
  span.textContent = window.i18n.getMessage(name);
  span.style.cssText = `
    background-color: #f0f0f0;
    color: #666;
    cursor: not-allowed;
  `;
  return span;
}

function createEnabledSwitch(enabled) {
  const label = document.createElement('label');
  label.className = 'switch';
  label.innerHTML = `
    <input type="checkbox" class="engine-enabled" ${enabled ? 'checked' : ''}>
    <span class="slider round"></span>
  `;
  return label;
}

function createDeleteButton() {
  const button = document.createElement('button');
  button.className = 'delete-btn';
  button.title = window.i18n.getMessage('delete');
  button.innerHTML = `
    <svg class="delete-icon" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1H11zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"/>
    </svg>
  `;
  return button;
}

// 简化版的 Toast 提示函数
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #4CAF50;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    z-index: 9999;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 1000);
}

// 修改保存函数
async function saveEngines() {
  try {
    const engines = [];
    const items = document.querySelectorAll('.engine-item');
    
    items.forEach(item => {
      const nameElement = item.querySelector('.engine-name');
      const urlInput = item.querySelector('.engine-url');
      const timeoutInput = item.querySelector('.engine-timeout');
      const enabledInput = item.querySelector('.engine-enabled');

      // 检查必要元素是否存在
      if (!nameElement || !urlInput || !timeoutInput || !enabledInput) {
        throw new Error('Missing required elements');
      }

      // 获取名称（区分 input 和 span）
      const name = nameElement.tagName.toLowerCase() === 'input' ? 
        nameElement.value : 
        nameElement.textContent;

      const url = urlInput.value;
      const timeout = parseInt(timeoutInput.value) || 10000;
      const enabled = enabledInput.checked;
      const isCustom = nameElement.tagName.toLowerCase() === 'input';

      // 验证必要的值
      if (!name || !url) {
        throw new Error('名称和URL不能为空');
      }

      engines.push({ name, url, timeout, enabled, isCustom });
    });

    await chrome.storage.sync.set({ engines });
    showToast('保存成功');
  } catch (error) {
    console.error('保存失败:', error);
    showToast('保存失败: ' + error.message);
  }
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
      // 只明确设置为展开时才展开
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

// 获取默认搜索引擎配置
function getDefaultEngines() {
  const defaultEngines = {
    'google': {
      name: '谷歌',
      url: 'https://www.google.com/search?q=%s',
      timeout: 10000,
      enabled: true,
      isCustom: false
    },
    'baidu': {
      name: '百度',
      url: 'https://www.baidu.com/s?wd=%s',
      timeout: 10000,
      enabled: true,
      isCustom: false
    },
    'bing': {
      name: '必应',
      url: 'https://www.bing.com/search?q=%s',
      timeout: 10000,
      enabled: true,
      isCustom: false
    },
    'sogou': {
      name: '搜狗',
      url: 'https://www.sogou.com/web?query=%s',
      timeout: 10000,
      enabled: true,
      isCustom: false
    }
  };
  return Object.values(defaultEngines);
}

// 初始化折叠面板
function initializeCollapsibles() {
  document.querySelectorAll('.collapsible').forEach(panel => {
    const header = panel.querySelector('.collapsible-header');
    const content = panel.querySelector('.collapsible-content');
    
    if (header && content) {
      header.addEventListener('click', () => {
        panel.classList.toggle('active');
        
        if (panel.classList.contains('active')) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0';
        }
      });
    }
  });
}

// 添加介绍部分的展开/收起功能
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  
  const introHeader = document.getElementById('introHeader');
  const introContent = document.getElementById('introContent');
  
  introHeader.addEventListener('click', function() {
    introContent.classList.toggle('collapsed');
    const toggleIcon = introHeader.querySelector('.toggle-icon');
    toggleIcon.style.transform = introContent.classList.contains('collapsed') 
      ? 'rotate(-90deg)' 
      : 'rotate(0deg)';
  });
});

// 在 DOMContentLoaded 时初始化应用
document.addEventListener('DOMContentLoaded', initializeApp); 