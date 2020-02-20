const puppeteer = require('puppeteer');
const server = require('./server.js');
const fs = require('fs');
require('dotenv').config();

async function getCXPriceData() {
  let siteUrl = 'https://apex.prosperousuniverse.com/';

  //set headless to false to show scraping in a browser window
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let date = new Date();

  let data = {
    refreshDate: date,
    katoa: {},
    montem: {},
    promitor: {}
  };

  let page = await browser.newPage();

  //enables console logging inside of page.evaluate
  page.on('console', consoleObj => console.log(consoleObj.text()));

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

  let loaded = false;
  let testCount = 0;

  for (let i = 0; i < 19; i++) {
    await page.click(
      '#container > div > div > div > div:nth-child(3) > div > div > div.Window__body___2JyiKBP > div.Tile__tile___38KoLVk > div > div.TileFrame__body___3OLRB4K.fonts__font-regular___w47oqm8.type__type-regular___1Ad5n0D > div > div > div.ScrollView__view___2OqtkYJ > div > div.ActionBar__container___KgdHqdA > div'
    );

    for (let j = 0; j < 7; j++) {
      await page.keyboard.press('ArrowUp');
    }

    for (let j = 0; j < i; j++) {
      await page.keyboard.press('ArrowDown');
    }

    await page.waitFor(200);

    await page.keyboard.press('Enter');

    /*loaded = false;
    testCount = 0;
    while (loaded == false && testCount < 50000) {
      let loaded = await page.evaluate(() => {
        let table = document.querySelector(
          '#container > div > div > div > div:nth-child(3) > div > div > div.Window__body___2JyiKBP > div.Tile__tile___38KoLVk > div > div.TileFrame__body___3OLRB4K.fonts__font-regular___w47oqm8.type__type-regular___1Ad5n0D > div > div > div.ScrollView__view___2OqtkYJ > div > div:nth-child(6) > table'
        );

        console.log(table);
        console.log(table == null);

        if (table == true) {
          return true;
        }
        return false;
      });
      testCount++;
      console.log(testCount);
    }*/

    await page.waitFor(8000);

    data = await addCurrentExchangeCategory('promitor', data, page);

    if (i == 18) {
      writeDataToFile(data);
    }
  }

  async function addCurrentExchangeCategory(exchangeName, exchangeData, page) {
    let CXData = await page.evaluate(
      ({ exchangeName, exchangeData }) => {
        let importedExchangeData = exchangeData;

        let table = document.querySelector(
          '#container > div > div > div > div:nth-child(3) > div > div > div.Window__body___2JyiKBP > div.Tile__tile___38KoLVk > div > div.TileFrame__body___3OLRB4K.fonts__font-regular___w47oqm8.type__type-regular___1Ad5n0D > div > div > div.ScrollView__view___2OqtkYJ > div > div:nth-child(6) > table'
        );

        function grabAndTrimTableValue(table, row, cell) {
          let tableString = table.rows[row].cells[cell].innerText;

          for (let i = 0; i < tableString.length; i++) {
            if (tableString.substring(i, i + 1) == '\n') {
              return tableString.substring(0, i);
            }
          }
          return tableString;
        }

        let rows = table.rows;
        let cells;

        for (let i = 1; i < rows.length; i++) {
          let cells = rows[i].length;

          importedExchangeData[exchangeName][
            grabAndTrimTableValue(table, i, 0)
          ] = {
            name: grabAndTrimTableValue(table, i, 1),
            askPrice: grabAndTrimTableValue(table, i, 3),
            bidPrice: grabAndTrimTableValue(table, i, 4)
          };
        }
        return importedExchangeData;
      },
      { exchangeName, exchangeData }
    );

    console.log(CXData);
    return CXData;
  }

  debugger;

  function writeDataToFile(data) {
    fs.writeFile(
      'CXItemInfo.json',
      JSON.stringify(data),
      'utf8',
      concludeScraping
    );
  }

  function concludeScraping() {
    console.log('Data Scrape Complete Successfully');
    server.loadCXItemDataFromFile();
  }
}

exports.getCXPriceData = getCXPriceData;
