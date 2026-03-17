// AI Web Translator - Content Script

let settings = null;
let sidePanel = null;
let translationCache = new Map();
let observer = null;
let isTranslating = false;

// 初始化
async function init() {
  try {
    const result = await chrome.storage.local.get('settings');
    settings = result.settings || {};
  } catch (error) {
    console.error('Failed to load settings:', error);
    settings = {};
  }
  
  // 监听来自 popup 的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startTranslation') {
      createSidePanel();
    } else if (message.action === 'updateSettings') {
      settings = message.settings;
    }
    sendResponse({ success: true });
    return true;
  });
  
  // 自动翻译
  if (settings.autoTranslate) {
    createSidePanel();
  }
}

// 创建侧边面板
function createSidePanel() {
  if (sidePanel) return;
  
  // 创建容器
  const container = document.createElement('div');
  container.id = 'ai-translator-container';
  container.innerHTML = `
    <div class="translator-header">
      <h2>🌐 AI 翻译</h2>
      <div class="translator-controls">
        <button class="close-btn" title="关闭">×</button>
      </div>
    </div>
    <div class="translator-body">
      <div class="original-panel">
        <div class="panel-header">原文</div>
        <div class="panel-content" id="original-content"></div>
      </div>
      <div class="translated-panel">
        <div class="panel-header">翻译 (<span id="target-lang-display">${settings.targetLang || 'zh-CN'}</span>)</div>
        <div class="panel-content" id="translated-content"></div>
      </div>
    </div>
    <div class="translator-footer">
      <div class="progress-bar">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
      <span class="status-text" id="status-text">就绪</span>
    </div>
  `;
  
  document.body.appendChild(container);
  sidePanel = container;
  
  // 绑定事件
  container.querySelector('.close-btn').addEventListener('click', closeSidePanel);
  
  // 提取并翻译内容
  extractAndTranslate();
  
  // 监听滚动
  if (settings.syncScroll) {
    setupSyncScroll();
  }
  
  // 监听悬浮
  if (settings.hoverHighlight) {
    setupHoverHighlight();
  }
}

// 关闭侧边面板
function closeSidePanel() {
  if (sidePanel) {
    sidePanel.remove();
    sidePanel = null;
  }
}

// 提取页面内容
function extractContent() {
  const elements = [];
  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'];
  const skipClasses = ['nav', 'navbar', 'sidebar', 'menu', 'ads', 'advertisement'];
  
  // 过滤函数
  function shouldSkip(element) {
    if (skipTags.includes(element.tagName)) return true;
    if (settings.filterCode && (element.tagName === 'CODE' || element.tagName === 'PRE')) return true;
    if (settings.filterMath && element.classList.contains('math')) return true;
    if (settings.filterNav) {
      const className = element.className.toLowerCase();
      if (skipClasses.some(c => className.includes(c))) return true;
    }
    return false;
  }
  
  // 遍历 DOM
  function traverse(node) {
    if (shouldSkip(node)) return;
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text.length > 10 && text.length < 500) {
        elements.push({
          text: text,
          element: node.parentElement,
          id: elements.length
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 只处理块级元素
      const display = window.getComputedStyle(node).display;
      if (['block', 'flex', 'grid', 'list-item'].includes(display)) {
        node.childNodes.forEach(child => traverse(child));
      }
    }
  }
  
  document.body.childNodes.forEach(node => traverse(node));
  return elements;
}

// 提取并翻译
async function extractAndTranslate() {
  if (isTranslating) return;
  isTranslating = true;
  
  const content = extractContent();
  const originalContent = document.getElementById('original-content');
  const translatedContent = document.getElementById('translated-content');
  
  if (!originalContent || !translatedContent) return;
  
  originalContent.innerHTML = '';
  translatedContent.innerHTML = '';
  
  // 瀑布式翻译
  const batchSize = 5;
  for (let i = 0; i < content.length; i += batchSize) {
    const batch = content.slice(i, i + batchSize);
    
    // 添加到原文面板
    batch.forEach(item => {
      const div = document.createElement('div');
      div.className = 'text-segment';
      div.dataset.id = item.id;
      div.textContent = item.text;
      originalContent.appendChild(div);
    });
    
    // 翻译
    updateProgress(i, content.length);
    setStatus(`翻译中... ${Math.round((i / content.length) * 100)}%`);
    
    try {
      const translations = await translateBatch(batch);
      translations.forEach((text, idx) => {
        const div = document.createElement('div');
        div.className = 'text-segment translated';
        div.dataset.id = batch[idx].id;
        div.textContent = text;
        translatedContent.appendChild(div);
      });
    } catch (error) {
      console.error('Translation error:', error);
      batch.forEach(item => {
        const div = document.createElement('div');
        div.className = 'text-segment translated error';
        div.dataset.id = item.id;
        div.textContent = '[翻译失败] ' + item.text;
        translatedContent.appendChild(div);
      });
    }
    
    // 等待一下，避免速率限制
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  updateProgress(content.length, content.length);
  setStatus('翻译完成');
  isTranslating = false;
}

// 批量翻译
async function translateBatch(batch) {
  const texts = batch.map(item => item.text);
  const cacheKey = JSON.stringify(texts) + settings.targetLang;
  
  // 检查缓存
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  // 构建翻译请求
  const prompt = `Translate the following texts to ${settings.targetLang}. Only output the translations, one per line, in the same order. Do not translate code, formulas, or proper nouns.

Texts:
${texts.map((t, i) => `[${i}] ${t}`).join('\n')}

Translations:`;
  
  // 调用 API
  const translations = await callTranslationAPI(prompt);
  
  // 解析结果
  const result = translations.split('\n').map(t => t.trim()).filter(t => t);
  
  // 缓存
  translationCache.set(cacheKey, result);
  
  return result;
}

// 调用翻译 API
async function callTranslationAPI(prompt) {
  const { provider, model, apiKey, baseUrl } = settings;
  
  let url = '';
  let headers = {};
  let body = {};
  
  switch (provider) {
    case 'openai':
      url = (baseUrl || 'https://api.openai.com/v1') + '/chat/completions';
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      body = {
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000
      };
      break;
      
    case 'anthropic':
      url = 'https://api.anthropic.com/v1/messages';
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };
      body = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      };
      break;
      
    case 'google':
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2000 }
      };
      break;
      
    default:
      throw new Error('Unsupported provider: ' + provider);
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  
  // 解析不同 API 的响应
  if (provider === 'openai' || provider === 'azure') {
    return data.choices[0].message.content;
  } else if (provider === 'anthropic') {
    return data.content[0].text;
  } else if (provider === 'google') {
    return data.candidates[0].content.parts[0].text;
  }
  
  throw new Error('Unknown provider response format');
}

// 同步滚动
function setupSyncScroll() {
  const originalPanel = document.getElementById('original-content');
  const translatedPanel = document.getElementById('translated-content');
  
  if (!originalPanel || !translatedPanel) return;
  
  let isScrolling = false;
  
  originalPanel.addEventListener('scroll', () => {
    if (isScrolling) return;
    isScrolling = true;
    
    const ratio = originalPanel.scrollTop / (originalPanel.scrollHeight - originalPanel.clientHeight);
    translatedPanel.scrollTop = ratio * (translatedPanel.scrollHeight - translatedPanel.clientHeight);
    
    setTimeout(() => { isScrolling = false; }, 50);
  });
  
  translatedPanel.addEventListener('scroll', () => {
    if (isScrolling) return;
    isScrolling = true;
    
    const ratio = translatedPanel.scrollTop / (translatedPanel.scrollHeight - translatedPanel.clientHeight);
    originalPanel.scrollTop = ratio * (originalPanel.scrollHeight - originalPanel.clientHeight);
    
    setTimeout(() => { isScrolling = false; }, 50);
  });
}

// 悬浮高亮
function setupHoverHighlight() {
  const container = document.getElementById('ai-translator-container');
  
  container.addEventListener('mouseover', (e) => {
    const segment = e.target.closest('.text-segment');
    if (!segment) return;
    
    const id = segment.dataset.id;
    const isOriginal = segment.closest('.original-panel');
    
    // 高亮对应段
    const targetPanel = isOriginal ? 
      document.getElementById('translated-content') : 
      document.getElementById('original-content');
    
    const target = targetPanel.querySelector(`.text-segment[data-id="${id}"]`);
    if (target) {
      segment.style.background = 'rgba(102, 126, 234, 0.2)';
      target.style.background = 'rgba(102, 126, 234, 0.2)';
    }
  });
  
  container.addEventListener('mouseout', (e) => {
    const segment = e.target.closest('.text-segment');
    if (!segment) return;
    
    const id = segment.dataset.id;
    const segments = container.querySelectorAll(`.text-segment[data-id="${id}"]`);
    segments.forEach(s => {
      s.style.background = '';
    });
  });
}

// 更新进度
function updateProgress(current, total) {
  const progress = (current / total) * 100;
  const fill = document.getElementById('progress-fill');
  if (fill) {
    fill.style.width = progress + '%';
  }
}

// 设置状态
function setStatus(text) {
  const status = document.getElementById('status-text');
  if (status) {
    status.textContent = text;
  }
}

// 启动
init();
