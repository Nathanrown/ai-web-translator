// AI Web Translator - Background Service Worker

// 监听扩展图标点击
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.tabs.sendMessage(tab.id, {
    action: 'startTranslation'
  });
});

// 监听安装
chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Web Translator installed');
  
  // 设置默认配置
  chrome.storage.local.set({
    settings: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      apiKey: '',
      baseUrl: '',
      targetLang: 'zh-CN',
      autoTranslate: false,
      syncScroll: true,
      hoverHighlight: true,
      filterCode: true,
      filterMath: true,
      filterNav: true
    }
  });
});

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    chrome.storage.local.get('settings', (result) => {
      sendResponse(result.settings || {});
    });
    return true;
  }
  
  if (message.action === 'translate') {
    translateText(message.text, message.settings)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Translation error:', error);
        sendResponse({ error: error.message });
      });
    return true;
  }
});

// 翻译函数
async function translateText(text, settings) {
  const { provider, model, apiKey, baseUrl, targetLang } = settings;
  
  const prompt = `Translate the following text to ${targetLang}. Only output the translation, do not include any explanations or notes. Do not translate code, formulas, or proper nouns.

Text: ${text}

Translation:`;
  
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
        max_tokens: 1000
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
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      };
      break;
      
    case 'google':
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      headers = { 'Content-Type': 'application/json' };
      body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
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
  
  if (provider === 'openai' || provider === 'azure') {
    return { translation: data.choices[0].message.content };
  } else if (provider === 'anthropic') {
    return { translation: data.content[0].text };
  } else if (provider === 'google') {
    return { translation: data.candidates[0].content.parts[0].text };
  }
  
  throw new Error('Unknown provider response format');
}
