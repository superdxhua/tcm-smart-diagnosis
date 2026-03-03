const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// 截图配置
const config = {
  baseUrl: 'http://localhost:5000',
  outputDir: path.join(__dirname, '../screenshots'),
  viewport: {
    width: 1920,
    height: 1080
  },
  // 需要截图的页面列表
  pages: [
    {
      name: '首页_中医健康管理平台',
      url: '/pages/index/index',
      waitSelector: 'body', // 等待页面加载完成的选择器
      description: '首页 - 包含免责声明'
    },
    {
      name: '登录页_中医健康管理平台',
      url: '/pages/login/index',
      waitSelector: 'body',
      description: '登录页 - 包含免责声明'
    },
    {
      name: '注册页_中医健康管理平台',
      url: '/pages/register/index',
      waitSelector: 'body',
      description: '注册页 - 包含免责声明'
    },
    {
      name: '免责声明_中医健康管理平台',
      url: '/pages/disclaimer/index',
      waitSelector: 'body',
      description: '免责声明页 - 完整页面'
    }
  ]
};

async function takeScreenshot() {
  console.log('🚀 开始截图...\n');

  // 创建输出目录
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // 启动浏览器
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport(config.viewport);

    // 遍历所有需要截图的页面
    for (const pageInfo of config.pages) {
      console.log(`📸 正在截图: ${pageInfo.name}`);
      console.log(`   URL: ${pageInfo.url}`);
      console.log(`   描述: ${pageInfo.description}`);

      try {
        // 访问页面
        await page.goto(`${config.baseUrl}${pageInfo.url}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // 等待指定元素加载完成
        if (pageInfo.waitSelector) {
          try {
            await page.waitForSelector(pageInfo.waitSelector, {
              timeout: 10000
            });
          } catch (error) {
            console.warn(`   ⚠️ 选择器 ${pageInfo.waitSelector} 未找到，继续截图...`);
          }
        }

        // 等待一段时间，确保页面完全渲染
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 滚动到页面底部（确保免责声明可见）
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });

        // 等待滚动完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 截取完整页面
        const filePath = path.join(config.outputDir, `${pageInfo.name}.png`);
        await page.screenshot({
          path: filePath,
          fullPage: true,
          type: 'png'
        });

        console.log(`   ✅ 截图成功: ${filePath}\n`);

      } catch (error) {
        console.error(`   ❌ 截图失败: ${error.message}`);
        console.error(`   错误详情: ${error.stack}\n`);
        
        // 继续截图下一个页面
        continue;
      }
    }

    console.log('🎉 所有截图完成！');
    console.log(`📁 截图保存位置: ${config.outputDir}`);
    console.log(`\n生成的截图文件:`);

    // 列出所有生成的截图文件
    const files = fs.readdirSync(config.outputDir);
    files.forEach(file => {
      const filePath = path.join(config.outputDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

  } catch (error) {
    console.error('❌ 截图过程中发生错误:', error);
  } finally {
    // 关闭浏览器
    await browser.close();
  }
}

// 执行截图
takeScreenshot().catch(error => {
  console.error('❌ 截图脚本执行失败:', error);
  process.exit(1);
});
