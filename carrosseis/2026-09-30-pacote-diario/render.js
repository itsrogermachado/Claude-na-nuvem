// Renderiza posts/<slug>/html/*.html em PNG 1080x1350 (depois converter.py gera os JPG).
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const base = path.join(__dirname, 'posts');
  for (const dir of fs.readdirSync(base).sort()) {
    const h = path.join(base, dir, 'html');
    if (!fs.existsSync(h)) continue;
    for (const f of fs.readdirSync(h).sort()) {
      await p.goto('file://' + path.join(h, f), { waitUntil: 'load' });
      await p.screenshot({ path: path.join(base, dir, f.replace('.html', '.png')) });
    }
  }
  await b.close();
})();
