const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  fs.mkdirSync('png', { recursive: true });
  for (const f of fs.readdirSync('html').sort()) {
    await p.goto('file://' + path.resolve('html', f), { waitUntil: 'networkidle' });
    await p.screenshot({ path: 'png/slide-' + f.replace('.html', '.png') });
  }
  await b.close();
})();
