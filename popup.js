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
    // initializeCollapsibles();

    // 加载搜索引擎
    await loadEngines();

    // 初始化事件监听
    initializeEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    showToast('Initialization failed', 'error');
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
    showToast('Button initialization failed', 'error');
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
    showToast('Failed to load search engines', 'error');
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

    const deleteButton = createDeleteButton();
    deleteButton.addEventListener('click', function () {
      item.remove();
      // 在这里添加更新存储的逻辑
    });

    item.appendChild(deleteButton);
    container.appendChild(item);
  } catch (error) {
    console.error('Error adding engine input:', error);
    showToast('Failed to add search engine', 'error');
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

      if (!nameElement || !urlInput || !timeoutInput || !enabledInput) {
        throw new Error('Missing required elements');
      }

      const name = nameElement.tagName.toLowerCase() === 'input' ?
        nameElement.value :
        nameElement.textContent;

      const url = urlInput.value;
      const timeout = parseInt(timeoutInput.value) || 10000;
      const enabled = enabledInput.checked;
      const isCustom = nameElement.tagName.toLowerCase() === 'input';

      if (!name || !url) {
        throw new Error('Name and URL cannot be empty');
      }

      engines.push({ name, url, timeout, enabled, isCustom });
    });

    await chrome.storage.sync.set({ engines });

    // 使用 try-catch 包裹消息发送
    try {
      await chrome.runtime.sendMessage({ type: 'ENGINES_UPDATED' });
      showToast('Settings saved successfully');
    } catch (messageError) {
      console.error('Failed to send message:', messageError);
      showToast('Saved successfully, but failed to update background. Please reload extension.');
    }
  } catch (error) {
    console.error('Save failed:', error);
    showToast('Save failed: ' + error.message);
  }
}

// // 在文件开头添加
// function initializeIntroSection() {
//   const introHeader = document.getElementById('introHeader');
//   const introContent = document.getElementById('introContent');
//   const toggleIcon = introHeader.querySelector('.toggle-icon');

//   // 默认设置为收起状态
//   toggleIcon.style.transform = 'rotate(-90deg)';

//   // 从存储中获取状态，但默认为 true（收起）
//   chrome.storage.local.get('introCollapsed', (data) => {
//     const isCollapsed = data.introCollapsed === undefined ? true : data.introCollapsed;
//     if (!isCollapsed) {
//       // 只明确设置为展开时才展开
//       introContent.classList.remove('collapsed');
//       toggleIcon.style.transform = '';
//     }
//   });

//   introHeader.addEventListener('click', () => {
//     const isCollapsed = introContent.classList.toggle('collapsed');
//     toggleIcon.style.transform = isCollapsed ? 'rotate(-90deg)' : '';
//     chrome.storage.local.set({ introCollapsed: isCollapsed });
//   });
// }

// 获取默认搜索引擎配置
function getDefaultEngines() {
  const defaultEngines = {
    'google': {
      name: 'Google',
      url: 'https://www.google.com/search?q=%s',
      timeout: 10000,
      enabled: true,
      isCustom: false
    },
    'bing': {
      name: 'Bing',
      url: 'https://www.bing.com/search?q=%s',
      timeout: 10000,
      enabled: true,
      isCustom: false
    },
    'baidu': {
      name: 'Baidu',
      url: 'https://www.baidu.com/s?wd=%s',
      timeout: 10000,
      enabled: true,
      isCustom: false
    }
  };
  return Object.values(defaultEngines);
}

// // 初始化折叠面板
// function initializeCollapsibles() {
//   document.querySelectorAll('.collapsible').forEach(panel => {
//     const header = panel.querySelector('.collapsible-header');
//     const content = panel.querySelector('.collapsible-content');

//     if (header && content) {
//       header.addEventListener('click', () => {
//         panel.classList.toggle('active');

//         if (panel.classList.contains('active')) {
//           content.style.maxHeight = content.scrollHeight + 'px';
//         } else {
//           content.style.maxHeight = '0';
//         }
//       });
//     }
//   });
// }

// // 添加介绍部分的展开/收起功能
// document.addEventListener('DOMContentLoaded', function () {
//   console.log('DOM Content Loaded');

//   const introHeader = document.getElementById('introHeader');
//   const introContent = document.getElementById('introContent');

//   introHeader.addEventListener('click', function () {
//     introContent.classList.toggle('collapsed');
//     const toggleIcon = introHeader.querySelector('.toggle-icon');
//     toggleIcon.style.transform = introContent.classList.contains('collapsed')
//       ? 'rotate(-90deg)'
//       : 'rotate(0deg)';
//   });
// });

// 在 DOMContentLoaded 时初始化应用
document.addEventListener('DOMContentLoaded', initializeApp);

document.addEventListener('DOMContentLoaded', function () {
  // 获取所有删除按钮
  var deleteButtons = document.querySelectorAll('.delete-btn');

  // 为每个按钮添加点击事件处理器
  deleteButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      // 获取要删除的元素，这里假设要删除的元素是按钮的父元素
      var itemToDelete = button.parentElement;

      // 从 DOM 中移除元素
      itemToDelete.remove();

      // 可以在这里添加其他逻辑，如更新存储、发送删除请求等
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
    var addEngineBtn = document.getElementById('addEngine');
    if (addEngineBtn) {
        addEngineBtn.addEventListener('click', function() {
            console.log('Add engine button clicked');
            // Add engine logic
        });
    } else {
        console.error('Add engine button not found');
    }
}); 