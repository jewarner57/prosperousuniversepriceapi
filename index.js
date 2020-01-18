const puppeteer = require('puppeteer');
const keys = require('./keys/keys.json');

(async () => {
  let siteUrl = 'https://apex.prosperousuniverse.com/';

  let browser = await puppeteer.launch({ headless: false });
  let page = await browser.newPage();

  await page.goto(siteUrl, { timeout: 0, waitUntil: 'networkidle2' });

  await page.type('#login', keys.email, { delay: 100 });

  await page.type('#password', keys.password, { delay: 100 });

  await page.click('.btn-primary');

  await page.waitFor(5000);

  await page.click(
    '#container > div > div > div > div.Frame__body___2ejRPw9 > div.Frame__foot___28jbfLO > div:nth-child(1) > div'
  );

  await page.type(
    '#container > div > div > div > div:nth-child(3) > div > div > div.Window__body___2JyiKBP > div.Tile__tile___38KoLVk > div.Tile__selector___3iXBf3h > form > div > input',
    'CX IC1',
    { delay: 100 }
  );

  await page.keyboard.press('Enter');

  await page.click(
    '#container > div > div > div > div:nth-child(3) > div > div > div.Window__body___2JyiKBP > div.Tile__tile___38KoLVk > div > div.TileFrame__body___3OLRB4K.fonts__font-regular___w47oqm8.type__type-regular___1Ad5n0D > div > div > div.ScrollView__view___2OqtkYJ > div > div.ActionBar__container___KgdHqdA > div'
  );

  await page.waitFor(100);

  for (let i = 0; i < 7; i++) {
    await page.keyboard.press('ArrowUp');
  }
  await page.keyboard.press('Enter');

  await page.waitFor(5000);

  let data = await page.evaluate(() => {
    let table = document.querySelector(
      '#container > div > div > div > div:nth-child(3) > div > div > div.Window__body___2JyiKBP > div.Tile__tile___38KoLVk > div > div.TileFrame__body___3OLRB4K.fonts__font-regular___w47oqm8.type__type-regular___1Ad5n0D > div > div > div.ScrollView__view___2OqtkYJ > div > div:nth-child(6) > table'
    );

    let exchangeData = [];
    for (let i = 0; i < 5; i++) {
      exchangeData[i] = [];
    }

    let rows = [];
    rows = table.rows;
    let cells = [];

    for (let i = 1; i < rows.length; i++) {
      cells = rows[i].cells;
      for (let j = 0; j < 5; j++) {
        exchangeData[j][i - 1] = table.rows[i].cells[j].innerText;
      }
    }

    return {
      exchangeData
    };
  });

  //remove in production, for debugging only
  await page.waitFor(5000);

  console.log(data);
  console.log(page.url());

  await page.screenshot({ path: 'screenshot.png' });
  debugger;

  await browser.close();
})();
