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
      div.innerHTML = `
        <input type="text" class="engine-name" 
          placeholder="${window.i18n.getMessage('searchEngineName')}" 
          value="${name}">
        <input type="text" class="engine-url" 
          placeholder="${window.i18n.getMessage('searchUrl')}" 
          value="${url}">
        <input type="number" class="engine-timeout" 
          placeholder="${window.i18n.getMessage('timeout')}" 
          value="${timeout}">
        <label class="switch">
          <input type="checkbox" class="engine-enabled" ${enabled ? 'checked' : ''}>
          <span class="slider round"></span>
        </label>
        ${deleteButton}
      `;
    } else {
      div.innerHTML = `
        <span class="engine-name" data-engine-key="${name}">${window.i18n.getMessage(name)}</span>
        <input type="text" class="engine-url" 
          placeholder="${window.i18n.getMessage('searchUrl')}" 
          value="${url}">
        <input type="number" class="engine-timeout" 
          placeholder="${window.i18n.getMessage('timeout')}" 
          value="${timeout}">
        <label class="switch">
          <input type="checkbox" class="engine-enabled" ${enabled ? 'checked' : ''}>
          <span class="slider round"></span>
        </label>
        ${deleteButton}
      `;
    }

    // 添加删除按钮事件监听
    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
      div.remove();
    });

    container.appendChild(div);
  } catch (error) {
    console.error('Error adding engine input:', error);
    showToast('添加搜索引擎失败', 'error');
  }
}

// 添加显示提示的函数
function showToast(message, type = 'info') {
  // 移除可能存在的旧 toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.style.cssText = `
    position: fixed !important;
    bottom: 20px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background-color: ${type === 'success' ? '#4CAF50' : '#f44336'} !important;
    color: white !important;
    padding: 12px 24px !important;
    border-radius: 4px !important;
    z-index: 9999 !important;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // 强制重绘
  toast.offsetHeight;

  // 显示
  toast.style.opacity = '1';

  // 3秒后隐藏
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 修改保存设置函数
async function saveEngines() {
  console.log('Save button clicked');
  
  try {
    const engines = [];
    const items = document.querySelectorAll('.engine-item');
    
    if (items.length === 0) {
      throw new Error('No engines to save');
    }

    items.forEach(item => {
      const nameElement = item.querySelector('.engine-name');
      const name = nameElement.tagName === 'INPUT' ? 
        nameElement.value : 
        nameElement.getAttribute('data-engine-key');

      const url = item.querySelector('.engine-url').value;
      const timeout = parseInt(item.querySelector('.engine-timeout').value);
      const enabled = item.querySelector('.engine-enabled').checked;
      const isCustom = nameElement.tagName === 'INPUT';

      if (!name || !url) {
        throw new Error('Invalid engine configuration');
      }

      engines.push({ name, url, timeout, enabled, isCustom });
    });

    await chrome.storage.sync.set({ engines });
    console.log('Engines saved successfully');
    showToast('设置已保存', 'success');
  } catch (error) {
    console.error('Error saving engines:', error);
    showToast('保存失败，请重试', 'error');
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

// 获取默认搜索引擎配置
function getDefaultEngines() {
  return [
    { name: 'google', url: 'https://www.google.com/search?q=%s' },
    { name: 'baidu', url: 'https://www.baidu.com/s?wd=%s' },
    { name: 'bing', url: 'https://www.bing.com/search?q=%s' },
    { name: 'sogou', url: 'https://www.sogou.com/web?query=%s' }
  ];
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

