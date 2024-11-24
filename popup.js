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

// 获取本地化消息
function getMessage(key, substitutions = null) {
  return chrome.i18n.getMessage(key, substitutions);
}

// 初始化界面文本
function initializeUI() {
  // 设置标题
  document.getElementById('headerTitle').textContent = getMessage('headerTitle');
  
  // 设置按钮文本
  document.getElementById('addEngine').textContent = getMessage('addEngine');
  document.getElementById('saveEngines').textContent = getMessage('saveSettings');
  
  // 设置使用说明
  document.getElementById('usageGuideTitle').textContent = getMessage('usageGuideTitle');
  document.getElementById('usageStep1').textContent = getMessage('usageStep1');
  document.getElementById('usageStep2').textContent = getMessage('usageStep2');
  document.getElementById('usageStep3').textContent = getMessage('usageStep3');
  document.getElementById('usageStep4').textContent = getMessage('usageStep4');
  
  // 设置配置说明
  document.getElementById('configGuideTitle').textContent = getMessage('configGuideTitle');
  document.getElementById('configStep1').textContent = getMessage('configStep1');
  document.getElementById('configStep2').textContent = getMessage('configStep2');
  document.getElementById('configStep3').textContent = getMessage('configStep3');
  document.getElementById('configStep4').textContent = getMessage('configStep4');
  document.getElementById('configStep4Sub1').textContent = getMessage('configStep4Sub1');
  document.getElementById('configStep4Sub2').textContent = getMessage('configStep4Sub2');
}

// 添加搜索引擎输入框
function addEngineInput(name = '', url = '', timeout = 10000) {
  const container = document.getElementById('engineList');
  const div = document.createElement('div');
  div.className = 'engine-item';
  
  const selectOptions = Object.keys(defaultEngines)
    .map(engineName => `<option value="${engineName}" ${engineName === name ? 'selected' : ''}>${engineName}</option>`)
    .join('');
    
  div.innerHTML = `
    <select class="engine-name">
      <option value="">${getMessage('selectEngine')}</option>
      ${selectOptions}
      <option value="custom">${getMessage('customEngine')}</option>
    </select>
    <input type="text" class="engine-url" placeholder="${getMessage('urlPlaceholder')}" value="${url}">
    <input type="number" class="engine-timeout" placeholder="${getMessage('timeoutPlaceholder')}" value="${timeout}">
    <button class="btn btn-danger">${getMessage('deleteButton')}</button>
  `;
  
  // 添加选择搜索引擎的事件监听
  const select = div.querySelector('.engine-name');
  const urlInput = div.querySelector('.engine-url');
  const timeoutInput = div.querySelector('.engine-timeout');
  
  select.addEventListener('change', (e) => {
    const selectedEngine = e.target.value;
    if (selectedEngine && selectedEngine !== 'custom') {
      urlInput.value = defaultEngines[selectedEngine].url;
      timeoutInput.value = defaultEngines[selectedEngine].timeout;
      urlInput.readOnly = true;
    } else {
      urlInput.value = '';
      urlInput.readOnly = false;
    }
  });

  // 添加删除按钮事件监听
  div.querySelector('.btn-danger').addEventListener('click', () => {
    div.remove();
  });
  
  container.appendChild(div);
}

// 加载现有配置
function loadEngines() {
  chrome.storage.sync.get('searchEngines', (data) => {
    const container = document.getElementById('engineList');
    container.innerHTML = '';
    
    // 如果没有保存的配置，使用默认配置
    const engines = data.searchEngines || defaultEngines;
    
    // 确保至少显示所有默认搜索引擎
    Object.entries(engines).forEach(([name, engineData]) => {
      addEngineInput(name, engineData.url, engineData.timeout);
    });
  });
}

// 保存配置
function saveEngines() {
  const engines = {};
  document.querySelectorAll('.engine-item').forEach(item => {
    const name = item.querySelector('.engine-name').value;
    const url = item.querySelector('.engine-url').value;
    const timeout = parseInt(item.querySelector('.engine-timeout').value) || 10000;
    
    if (name && url) {
      engines[name] = {
        url: url,
        timeout: timeout
      };
    }
  });
  
  chrome.storage.sync.set({ searchEngines: engines }, () => {
    alert(getMessage('settingsSaved'));
  });
}

// 当文档加载完成时初始化UI
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  loadEngines();

  // 添加按钮事件监听
  document.getElementById('addEngine').addEventListener('click', () => {
    addEngineInput();
  });

  document.getElementById('saveEngines').addEventListener('click', saveEngines);
}); 