// Social Blade API 整合測試腳本
console.log('🧪 開始測試 Social Blade API 整合...\n');

// 測試配置
const CLIENT_ID = 'cli_eb5ed4868c62823b8665d8eb';
const TOKEN = 'fd2238a7f418f5c6599483d087e25936dca026ef12ee8e0314cc449dc2cc052a';
const BASE_URL = 'https://matrix.sbapis.com/b';

// 測試用的網紅 URL
const testUrls = [
  'https://www.youtube.com/c/MrBeast',
  'https://www.instagram.com/mrbeast',
  'https://www.facebook.com/MrBeast6000'
];

// 測試 Social Blade API 直接調用
async function testDirectAPI() {
  console.log('📡 測試 1: 直接調用 Social Blade API');
  
  try {
    const testQuery = 'mrbeast';
    const url = `${BASE_URL}/youtube/statistics?query=${encodeURIComponent(testQuery)}&history=default&allow-stale=false`;
    
    console.log(`🔍 請求 URL: ${url}`);
    
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
    
    console.log('✅ API 回應成功！');
    console.log('📊 回應狀態:', data.status);
    console.log('💳 剩餘額度:', data.info.credits.available);
    console.log('⏰ 過期時間:', data.info.access.seconds_to_expire, '秒');
    
    if (data.data && data.data.id) {
      console.log('📺 頻道資訊:');
      console.log('  - ID:', data.data.id.id);
      console.log('  - 名稱:', data.data.id.display_name);
      console.log('  - 訂閱者:', data.data.statistics.total.subscribers?.toLocaleString());
      console.log('  - 觀看數:', data.data.statistics.total.views?.toLocaleString());
      console.log('  - 等級:', data.data.misc.grade.grade);
      console.log('  - 全球排名:', data.data.ranks.sbrank?.toLocaleString());
    }
    
    return true;
  } catch (error) {
    console.error('❌ 直接 API 測試失敗:', error.message);
    return false;
  }
}

// 測試平台 API 整合
async function testPlatformAPI() {
  console.log('\n🚀 測試 2: 平台 API 整合');
  
  try {
    const testUrl = 'https://www.youtube.com/c/MrBeast';
    
    console.log(`🔍 測試 URL: ${testUrl}`);
    
    const response = await fetch('http://localhost:3000/api/analyze-influencer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: testUrl
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ 平台 API 整合成功！');
    console.log('📊 分析結果:');
    console.log('  - 數據來源:', result.result.dataSource);
    console.log('  - 網紅名稱:', result.result.displayName);
    console.log('  - 粉絲數:', result.result.followers);
    console.log('  - 評分:', result.result.score);
    console.log('  - 平台:', result.result.platform);
    
    if (result.result.dataSource === 'social_blade') {
      console.log('🎯 Social Blade 數據成功獲取！');
      console.log('  - Social Blade 等級:', result.result.socialBladeGrade?.grade);
      console.log('  - 全球排名:', result.result.socialBladeRanks?.global?.toLocaleString());
      console.log('  - 月成長:', result.result.growthData?.monthly?.toLocaleString());
    } else {
      console.log('⚠️ 使用了備用數據源:', result.result.dataSource);
    }
    
    return true;
  } catch (error) {
    console.error('❌ 平台 API 整合測試失敗:', error.message);
    return false;
  }
}

// 測試多平台支援
async function testMultiPlatform() {
  console.log('\n📱 測試 3: 多平台支援');
  
  const platforms = [
    { name: 'YouTube', query: 'mrbeast', endpoint: 'youtube' },
    { name: 'Instagram', query: 'mrbeast', endpoint: 'instagram' },
    { name: 'Facebook', query: 'mrbeast', endpoint: 'facebook' }
  ];
  
  for (const platform of platforms) {
    try {
      console.log(`\n🔍 測試 ${platform.name}...`);
      
      const url = `${BASE_URL}/${platform.endpoint}/statistics?query=${platform.query}&history=default&allow-stale=false`;
      
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
          console.log(`✅ ${platform.name} API 正常`);
          console.log(`  - 可用額度: ${data.info.credits.available}`);
        } else {
          console.log(`❌ ${platform.name} API 錯誤: ${data.status.error}`);
        }
      } else {
        console.log(`❌ ${platform.name} HTTP 錯誤: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${platform.name} 請求失敗: ${error.message}`);
    }
  }
}

// 執行所有測試
async function runAllTests() {
  console.log('🎯 Social Blade API 整合完整測試\n');
  console.log('═'.repeat(50));
  
  const test1 = await testDirectAPI();
  const test2 = await testPlatformAPI();
  await testMultiPlatform();
  
  console.log('\n' + '═'.repeat(50));
  console.log('📋 測試總結:');
  console.log(`  🔸 直接 API 調用: ${test1 ? '✅ 通過' : '❌ 失敗'}`);
  console.log(`  🔸 平台整合: ${test2 ? '✅ 通過' : '❌ 失敗'}`);
  console.log('  🔸 多平台支援: 如上所示');
  
  if (test1 && test2) {
    console.log('\n🎉 Social Blade API 整合成功！可以開始使用真實網紅數據！');
  } else {
    console.log('\n⚠️ 部分測試失敗，請檢查配置或API狀態');
  }
}

// 執行測試
runAllTests(); 