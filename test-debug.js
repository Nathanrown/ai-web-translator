// 诊断脚本 - 检查翻译插件配置

const puppeteer = require('puppeteer');

(async () => {
  console.log('🔍 翻译插件诊断...\n');
  
  // 1. 检查设置
  console.log('1. 检查 Chrome 存储设置...');
  const settings = await new Promise((resolve) => {
    chrome.storage.local.get('settings', (result) => {
      resolve(result.settings || null);
    });
  });
  
  if (!settings) {
    console.log('❌ 未找到设置！请先在插件配置中保存设置。');
    console.log('   1. 点击插件图标');
    console.log('   2. 输入 API Key');
    console.log('   3. 点击"保存配置"');
    return;
  }
  
  console.log('✅ 找到设置：');
  console.log('   Provider:', settings.provider || '未设置');
  console.log('   Model:', settings.model || '未设置');
  console.log('   API Key:', settings.apiKey ? '******' : '❌ 未设置');
  console.log('   Target Lang:', settings.targetLang || '未设置');
  
  // 2. 检查必要字段
  console.log('\n2. 检查必要字段...');
  const issues = [];
  
  if (!settings.provider) issues.push('API 提供商未设置');
  if (!settings.apiKey) issues.push('API Key 未设置');
  if (!settings.targetLang) issues.push('目标语言未设置');
  
  if (issues.length > 0) {
    console.log('❌ 发现问题：');
    issues.forEach(issue => console.log('   -', issue));
    console.log('\n请先完成插件配置！');
    return;
  }
  
  console.log('✅ 所有必要字段都已设置');
  
  // 3. 测试 API 连接
  console.log('\n3. 测试 API 连接...');
  console.log('   Provider:', settings.provider);
  console.log('   Model:', settings.model || 'gpt-4o-mini');
  
  if (settings.provider === 'openai') {
    const url = (settings.baseUrl || 'https://api.openai.com/v1') + '/chat/completions';
    console.log('   URL:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "test" in one word' }],
          max_tokens: 10
        })
      });
      
      if (response.ok) {
        console.log('✅ API 连接成功！');
      } else {
        const error = await response.text();
        console.log('❌ API 错误:', response.status, error);
      }
    } catch (error) {
      console.log('❌ 连接失败:', error.message);
    }
  }
  
  console.log('\n✅ 诊断完成！');
})();
