// Renderiza todos os html/ de cada carrossel em PNG 1080x1350.
// Requer playwright-core (npm i playwright-core) e o Chromium do ambiente.
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  for (const dir of fs.readdirSync(__dirname).filter(d => fs.existsSync(path.join(__dirname, d, 'html'))).sort()) {
    for (const f of fs.readdirSync(path.join(__dirname, dir, 'html')).sort()) {
      await p.goto('file://' + path.join(__dirname, dir, 'html', f), { waitUntil: 'load' });
      await p.screenshot({ path: path.join(__dirname, dir, 'slide-' + f.replace('.html', '.png')) });
    }
  }
  await b.close();
})();
