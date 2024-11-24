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
function addEngineInput(name = '', url = '', timeout = 10000) {
  console.log('Adding engine input:', { name, url, timeout });
  
  const container = document.getElementById('engineList');
  const div = document.createElement('div');
  div.className = 'engine-item';
  
  div.innerHTML = `
    <select class="engine-name">
      <option value="">选择搜索引擎</option>
      <option value="Google" ${name === 'Google' ? 'selected' : ''}>Google</option>
      <option value="百度" ${name === '百度' ? 'selected' : ''}>百度</option>
      <option value="custom">自定义</option>
    </select>
    <input type="text" class="engine-url" placeholder="搜索URL" value="${url}">
    <input type="number" class="engine-timeout" placeholder="超时(毫秒)" value="${timeout}">
    <button class="btn btn-danger">删除</button>
  `;
  
  // 添加选择搜索引擎的事件监听
  const select = div.querySelector('.engine-name');
  const urlInput = div.querySelector('.engine-url');
  const timeoutInput = div.querySelector('.engine-timeout');
  
  select.addEventListener('change', () => {
    handleEngineSelect(select, urlInput, timeoutInput);
  });

  // 如果是预设搜索引擎，设置为只读
  if (name && defaultEngines[name]) {
    urlInput.readOnly = true;
  }
  
  // 添加删除按钮事件
  div.querySelector('.btn-danger').addEventListener('click', () => {
    div.remove();
  });
  
  container.appendChild(div);
}

// 加载配置
function loadEngines() {
  console.log('Loading engines...');
  chrome.storage.sync.get('searchEngines', (data) => {
    const engines = data.searchEngines || defaultEngines;
    console.log('Loaded engines:', engines);
    
    Object.entries(engines).forEach(([name, engineData]) => {
      addEngineInput(name, engineData.url, engineData.timeout);
    });
  });
}

// 保存配置
function saveEngines() {
  console.log('Saving engines...');
  const engines = {};
  document.querySelectorAll('.engine-item').forEach(item => {
    const name = item.querySelector('.engine-name').value;
    const url = item.querySelector('.engine-url').value;
    const timeout = parseInt(item.querySelector('.engine-timeout').value) || 10000;
    
    if (name && url) {
      engines[name] = { url, timeout };
    }
  });
  
  console.log('Saving:', engines);
  chrome.storage.sync.set({ searchEngines: engines }, () => {
    alert('设置已保存！');
  });
}

// 在文件开头添加
function initializeIntroSection() {
  const introHeader = document.getElementById('introHeader');
  const introContent = document.getElementById('introContent');
  const toggleIcon = introHeader.querySelector('.toggle-icon');
  
  // 从存储中获取上次的状态
  chrome.storage.local.get('introCollapsed', (data) => {
    if (data.introCollapsed) {
      introContent.classList.add('collapsed');
      toggleIcon.style.transform = 'rotate(-90deg)';
    }
  });
  
  introHeader.addEventListener('click', () => {
    console.log('Header clicked'); // 调试日志
    const isCollapsed = introContent.classList.toggle('collapsed');
    
    // 更新图标旋转
    toggleIcon.style.transform = isCollapsed ? 'rotate(-90deg)' : '';
    
    // 保存状态
    chrome.storage.local.set({ introCollapsed: isCollapsed }, () => {
      console.log('State saved:', isCollapsed); // 调试日志
    });
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
    console.log('Add button clicked');
    addEngineInput();
  });
  
  // 保存按钮事件
  document.getElementById('saveEngines').addEventListener('click', saveEngines);
}); 