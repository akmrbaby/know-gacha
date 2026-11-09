// Scroll the actual sheet viewport, then verify the last text is fully exposed.
const { chromium } = require(process.env.MAP_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ locale: 'ja-JP', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => { Math.random = () => 0; });
    const button = name => page.getByRole('button', { name, exact: true });
    await page.goto(process.env.MAP_TEST_URL || 'http://127.0.0.1:8107');
    await button('最初の知識をひらく').click({ timeout: 120000 });
    await page.getByTestId('map-preview').waitFor();
    const progress = await page.evaluate(() => localStorage.getItem('knowgacha.progress.v1'));
    await button('詳細を開く').click();
    await page.getByText('引き上げて全文を読む', { exact: true }).waitFor();
    const scroll = page.getByTestId('map-sheet-scroll');
    const footer = page.getByText('試作用原稿 · 周辺語の閲覧は回数を消費しません。', { exact: true });
    const readToEnd = async () => {
      const box = await scroll.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + Math.min(100, box.height / 2));
      for (let i = 0; i < 30; i++) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(25);
        if (await scroll.evaluate(el => el.scrollTop + el.clientHeight >= el.scrollHeight - 1)) break;
      }
      const viewport = await scroll.boundingBox(), last = await footer.boundingBox();
      assert.ok(last.y >= viewport.y - 1 && last.y + last.height <= viewport.y + viewport.height - 8, 'entire final text is visible with bottom spacing');
      assert.ok(await scroll.evaluate(el => el.scrollTop > 0), 'content really scrolled');
      assert.equal(await page.getByRole('dialog').count(), 1);
    };
    await readToEnd();
    const handle = page.locator('[data-expo-ui-bottom-sheet-handle]');
    const grip = await handle.boundingBox();
    await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
    await page.mouse.down();
    await page.mouse.move(grip.x + grip.width / 2, 20, { steps: 15 });
    await page.mouse.up();
    await page.waitForTimeout(350);
    assert.ok((await scroll.boundingBox()).height > 600, 'drag expanded the sheet');
    await readToEnd();
    await page.setViewportSize({ width: 320, height: 568 });
    await page.addStyleTag({ content: '[data-testid="map-sheet-scroll"] [dir="auto"] { font-size:28px !important; line-height:40px !important; }' });
    await readToEnd();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
    await page.screenshot({ path: '/workspace/scratch/detail-sheet-bottom.png' });
    await page.getByRole('dialog').getByRole('button').filter({ hasText: '利用する技術' }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await button('詳細を開く').click();
    await page.getByText('つながりの理由', { exact: true }).waitFor();
    assert.equal(await scroll.evaluate(el => el.scrollTop), 0, 'new selection starts at the top');
    await button('詳細を閉じる').click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await button('選択を解除').click();
    await button('地図を拡大').click();
    await button('知識の一覧を開く').click();
    await page.getByTestId('map-list-scroll').waitFor();
    await button('一覧を閉じる').click();
    assert.equal(await page.evaluate(() => localStorage.getItem('knowgacha.progress.v1')), progress);
    assert.deepEqual(errors, []);
    console.log('PASS half/full sheet footer, real scroll after drag, small screen/large text, related selection reset, close/list/Map and unchanged progress');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
