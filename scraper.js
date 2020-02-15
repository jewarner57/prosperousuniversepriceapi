const puppeteer = require('puppeteer');
const server = require('./server.js');
const fs = require('fs');
require('dotenv').config();

async function getCXPriceData() {
  let siteUrl = 'https://apex.prosperousuniverse.com/';

  //set headless to false to show scraping in a browser window
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  let page = await browser.newPage();

  await page.goto(siteUrl, { timeout: 0, waitUntil: 'networkidle2' });

  await page.type('#login', process.env.email, { delay: 100 });

  await page.type('#password', process.env.password, { delay: 100 });

  await page.click('.btn-primary');

  await page.waitFor(10000);

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

  await page.waitFor(4000);

  let data = await page.evaluate(() => {
    let table = document.querySelector(
      '#container > div > div > div > div:nth-child(3) > div > div > div.Window__body___2JyiKBP > div.Tile__tile___38KoLVk > div > div.TileFrame__body___3OLRB4K.fonts__font-regular___w47oqm8.type__type-regular___1Ad5n0D > div > div > div.ScrollView__view___2OqtkYJ > div > div:nth-child(6) > table'
    );

    function grabAndTrimTableValue(table, row, cell) {
      let tableString = table.rows[row].cells[cell].innerText;

      for (let i = 0; i < tableString.length; i++) {
        if (tableString.substring(i, i + 1) == '\n') {
          return tableString.substring(0, i - 1);
        }
      }
      return tableString;
    }

    let date = new Date();

    let exchangeData = {
      refreshDate: date,
      promitor: {}
    };

    let rows = table.rows;
    let cells;

    for (let i = 1; i < rows.length; i++) {
      let cells = rows[i].length;

      exchangeData.promitor[grabAndTrimTableValue(table, i, 0)] = {
        name: grabAndTrimTableValue(table, i, 1),
        askPrice: grabAndTrimTableValue(table, i, 3),
        bidPrice: grabAndTrimTableValue(table, i, 4)
      };
    }

    return JSON.stringify(exchangeData);
  });

  debugger;
  await browser.close();

  fs.writeFile('CXItemInfo.json', data, 'utf8', concludeScraping);

  function concludeScraping() {
    console.log('Data Scrape Complete Successfully');
    server.loadCXItemDataFromFile();
  }
}

exports.getCXPriceData = getCXPriceData;
