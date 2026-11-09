// Web geometry/gesture checks. Native text rasterization and OS font scaling need an iPhone.
const { chromium } = require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ locale:'ja-JP',viewport: { width: 390, height: 1000 }, hasTouch: true, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto((process.env.MAP_TEST_URL || 'http://127.0.0.1:8082') + '/graph-demo');
    await page.getByText('デモ · 5件', { exact: true }).waitFor({ timeout: 120000 });
    const canvas = page.getByTestId('atlas-canvas');
    const session = await page.context().newCDPSession(page);
    async function pinch(ratio) {
      const bounds = await canvas.boundingBox();
      const cx = bounds.x + bounds.width / 2, cy = bounds.y + 30;
      const points = distance => [0, 1].map(id => ({ id: id + 1, x: cx + (id ? 1 : -1) * distance, y: cy, radiusX: 2, radiusY: 2 }));
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(80).slice(0, 1) });
      await page.waitForTimeout(50);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(80) });
      await page.waitForTimeout(50);
      for (let step = 1; step <= 12; step++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(80 * (1 + (ratio - 1) * step / 12)) });
        await page.waitForTimeout(20);
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(150);
    }
    async function textGeometry() {
      return canvas.locator('[data-testid^="atlas-label-"]').evaluateAll(labels => labels.map(label => {
        const element = label.firstElementChild;
        let current = element;
        while (current && !current.matches('[data-testid="atlas-canvas"]')) {
          const transform = getComputedStyle(current).transform;
          if (transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            if (Math.abs(matrix.a - 1) > 0.001 || Math.abs(matrix.d - 1) > 0.001) throw new Error('Text has a scaled ancestor');
          }
          current = current.parentElement;
        }
        const bounds = element.getBoundingClientRect();
        return { id: label.dataset.testid, width: Math.round(bounds.width * 1000) / 1000, height: Math.round(bounds.height * 1000) / 1000, font: getComputedStyle(element).fontSize };
      }));
    }
    async function noLabelOverlap() {
      const boxes = await canvas.locator('[data-testid^="atlas-label-"]').evaluateAll(labels => labels.filter(label => Number(getComputedStyle(label).opacity) > 0).map(label => ({ id: label.dataset.testid, ...label.getBoundingClientRect().toJSON() })));
      assert.ok(boxes.length > 0, 'some labels must remain visible');
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        assert.ok(a.right <= b.left + 0.1 || b.right <= a.left + 0.1 || a.bottom <= b.top + 0.1 || b.bottom <= a.top + 0.1, `labels overlap: ${a.id}, ${b.id}`);
      }
    }
    const lineLength = async () => canvas.locator('path').first().evaluate(element => {
      const p = element.getAttribute('d').match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi).map(Number);
      return Math.hypot(p[2] - p[0], p[3] - p[1]);
    });
    for (const count of [5, 10]) {
      await page.getByRole('button', { name: `${count}件のデモ`, exact: true }).click();
      await page.waitForTimeout(600);
      await noLabelOverlap();
      const before = await textGeometry(), length = await lineLength();
      await pinch(2);
      assert.ok(await lineLength() > length * 1.1, 'pinch must actually zoom the map');
      assert.deepEqual(await textGeometry(), before, 'zoom must preserve text layout and font size');
      const expandedLength = await lineLength();
      await pinch(0.6);
      assert.ok(await lineLength() < expandedLength * 0.95, 'pinch must also zoom out');
      assert.deepEqual(await textGeometry(), before);
      await noLabelOverlap();
    }
    await page.getByRole('button', { name: '一覧', exact: true }).click();
    await page.getByRole('button', { name: '光電融合 取得済み · 出典あり', exact: true }).click();
    await page.waitForTimeout(200);
    assert.equal(await page.getByTestId('atlas-label-photonics-electronics').evaluate(e => getComputedStyle(e).opacity), '1', 'selected knowledge name has priority');
    await page.getByTestId('map-sheet').getByRole('button', { name: '利用する技術 光通信', exact: true }).click();
    await page.waitForTimeout(200);
    assert.equal(await page.getByTestId('atlas-label-photonics-communication').evaluate(e => getComputedStyle(e).opacity), '1', 'selected relation label has priority');
    await noLabelOverlap();
    // Simulate larger text in Web to exercise remeasurement, not native OS font scaling.
    await canvas.locator('[data-testid^="atlas-label-"]').evaluateAll(labels => labels.forEach(label => {
      const text = label.firstElementChild, style = getComputedStyle(text);
      const size = parseFloat(style.fontSize), line = parseFloat(style.lineHeight);
      text.style.fontSize = `${size * 2}px`; text.style.lineHeight = `${line * 2}px`;
    }));
    await page.waitForTimeout(300);
    await noLabelOverlap();
    assert.deepEqual(errors, []);
    await page.screenshot({ path: '/tmp/knowgacha-map-labels.png' });
    console.log('PASS 5/10 nodes: real touch pinch changes map scale; all label types retain unscaled dimensions; selection priority, collisions and larger text remeasurement pass (Web only)');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
