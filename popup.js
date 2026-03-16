// 保存配置
async function saveSettings() {
  const settings = {
    provider: document.getElementById('provider').value,
    model: document.getElementById('model').value,
    apiKey: document.getElementById('apiKey').value,
    baseUrl: document.getElementById('baseUrl').value,
    targetLang: document.getElementById('targetLang').value,
    autoTranslate: document.getElementById('autoTranslate').checked,
    syncScroll: document.getElementById('syncScroll').checked,
    hoverHighlight: document.getElementById('hoverHighlight').checked,
    filterCode: document.getElementById('filterCode').checked,
    filterMath: document.getElementById('filterMath').checked,
    filterNav: document.getElementById('filterNav').checked
  };
  
  await chrome.storage.local.set({ settings });
  showStatus('✅ 配置已保存', 2000);
}

// 加载配置
async function loadSettings() {
  const result = await chrome.storage.local.get('settings');
  const settings = result.settings || {};
  
  if (settings.provider) document.getElementById('provider').value = settings.provider;
  if (settings.model) document.getElementById('model').value = settings.model;
  if (settings.apiKey) document.getElementById('apiKey').value = settings.apiKey;
  if (settings.baseUrl) document.getElementById('baseUrl').value = settings.baseUrl;
  if (settings.targetLang) document.getElementById('targetLang').value = settings.targetLang;
  if (settings.autoTranslate !== undefined) document.getElementById('autoTranslate').checked = settings.autoTranslate;
  if (settings.syncScroll !== undefined) document.getElementById('syncScroll').checked = settings.syncScroll;
  if (settings.hoverHighlight !== undefined) document.getElementById('hoverHighlight').checked = settings.hoverHighlight;
  if (settings.filterCode !== undefined) document.getElementById('filterCode').checked = settings.filterCode;
  if (settings.filterMath !== undefined) document.getElementById('filterMath').checked = settings.filterMath;
  if (settings.filterNav !== undefined) document.getElementById('filterNav').checked = settings.filterNav;
  
  updateModelOptions();
}

// 根据提供商更新模型选项
function updateModelOptions() {
  const provider = document.getElementById('provider').value;
  const modelSelect = document.getElementById('model');
  modelSelect.innerHTML = '';
  
  const models = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ],
    anthropic: [
      { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-opus', label: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' }
    ],
    google: [
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-pro', label: 'Gemini Pro' }
    ],
    azure: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-35-turbo', label: 'GPT-3.5 Turbo' }
    ],
    custom: [
      { value: 'custom-model', label: '自定义模型' }
    ]
  };
  
  (models[provider] || models.openai).forEach(m => {
    const option = document.createElement('option');
    option.value = m.value;
    option.textContent = m.label;
    modelSelect.appendChild(option);
  });
}

// 显示状态
function showStatus(message, duration = 3000) {
  const status = document.getElementById('status');
  status.textContent = message;
  setTimeout(() => {
    status.textContent = '';
  }, duration);
}

// 开始翻译
async function startTranslation() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  await chrome.tabs.sendMessage(tab.id, {
    action: 'startTranslation'
  });
  
  showStatus('🚀 翻译已启动', 2000);
  window.close();
}

// 事件监听
document.getElementById('saveBtn').addEventListener('click', saveSettings);
document.getElementById('startBtn').addEventListener('click', startTranslation);
document.getElementById('provider').addEventListener('change', updateModelOptions);

// 初始化
loadSettings();
