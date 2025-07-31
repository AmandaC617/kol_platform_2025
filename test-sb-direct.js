// 直接測試 Social Blade API
const fetch = require('node-fetch');

// 使用正確的認證信息
const CLIENT_ID = 'cli_eb5ed4868c62823b8665d8eb';
const TOKEN = '9f3b85809ebce4e83437d235fd24fd62fdc1f28b3ad0dcc0a235def1d3032f33';
const BASE_URL = 'https://matrix.sbapis.com/b';

async function testSocialBladeAPI() {
  console.log('🧪 測試 Social Blade API 直接調用');
  
  const testQueries = ['mrbeast', 'rick'];
  
  for (const query of testQueries) {
    try {
      console.log(`\n🔍 測試查詢: ${query}`);
      
      const url = `${BASE_URL}/youtube/statistics?query=${encodeURIComponent(query)}&history=default&allow-stale=false`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'clientid': CLIENT_ID,
          'token': TOKEN,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status.success) {
        console.log('✅ API 調用成功！');
        console.log(`📊 數據: ${data.data.id.display_name} - ${data.data.statistics.total.subscribers} 訂閱者`);
        console.log(`💳 剩餘額度: ${data.info.credits.available}`);
        console.log(`⭐ 等級: ${data.data.misc.grade.grade}`);
      } else {
        console.log('❌ API 返回失敗:', data.status.error);
      }
      
    } catch (error) {
      console.error(`❌ ${query} 測試失敗:`, error.message);
    }
  }
}

// 測試 Instagram
async function testInstagram() {
  console.log('\n📱 測試 Instagram API');
  
  try {
    const url = `${BASE_URL}/instagram/statistics?query=mrbeast&history=default&allow-stale=false`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'clientid': CLIENT_ID,
        'token': TOKEN,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status.success) {
        console.log('✅ Instagram API 正常');
        console.log(`📊 數據: ${data.data.id.display_name} - ${data.data.statistics.total.followers} 粉絲`);
      } else {
        console.log('❌ Instagram API 錯誤:', data.status.error);
      }
    } else {
      console.log('❌ Instagram HTTP 錯誤:', response.status);
    }
  } catch (error) {
    console.log('❌ Instagram 測試失敗:', error.message);
  }
}

// 執行測試
async function main() {
  console.log('🎯 Social Blade API 全面測試\n');
  console.log('═'.repeat(50));
  
  await testSocialBladeAPI();
  await testInstagram();
  
  console.log('\n' + '═'.repeat(50));
  console.log('✅ 測試完成');
}

main(); 