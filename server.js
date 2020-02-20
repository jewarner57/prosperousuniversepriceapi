const express = require('express');
const scraper = require('./scraper.js');
let CXData;
const fs = require('fs');
let refreshInProgress = false;
let refreshCooldown = 0; //set to 60

const app = express();
const port = process.env.PORT || 3000;
let server = app.listen(port, started);

function loadCXItemDataFromFile() {
  let rawdata = fs.readFileSync('./CXItemInfo.json');
  CXData = JSON.parse(rawdata);
  refreshInProgress = false;
}

function getTimeSinceRefresh() {
  let dateNow = new Date();
  let refreshDate = new Date(CXData.refreshDate);
  return Math.round(((dateNow - refreshDate) / 60000) * 10) / 10;
}

function started() {
  console.log('Server listening on port: ' + port);
  loadCXItemDataFromFile();
}

app.get('/', function(req, res) {
  res.send(
    'Route Help: Full Price List /cxdata, Refresh Data /refresh-price-data, View Time of Last Refresh /time-since-refresh'
  );
});

app.get('/cxdata', getFullItemList);

function getFullItemList(request, response) {
  response.send(CXData);
}

app.get('/cxdata/:exchange', getFullExchange);

function getFullExchange(request, response) {
  response.send(CXData[request.params.exchange]);
}

app.get('/cxdata/:exchange/:item', getItemByAbrev);

function getItemByAbrev(request, response) {
  response.send(
    CXData[request.params.exchange][request.params.item.toUpperCase()]
  );
}

app.get('/refresh-price-data', refreshPriceData);

function refreshPriceData(request, response) {
  let timeSinceRefresh = getTimeSinceRefresh();

  if (timeSinceRefresh > refreshCooldown && refreshInProgress == false) {
    scraper.getCXPriceData();
    refreshInProgress = true;
    response.send('Price data refresh has started. Please wait.');
  } else {
    response.send(
      'Price data refresh cooldown active. ' +
        (refreshCooldown - timeSinceRefresh) +
        ' minutes remaining until data refresh avaliable'
    );
  }
}

app.get('/time-since-refresh', timeSinceRefresh);

function timeSinceRefresh(request, response) {
  let dataStatus;
  let timeSinceRefresh = getTimeSinceRefresh();

  if (timeSinceRefresh < refreshCooldown) {
    dataStatus = 'Price data is recent.';
  } else {
    dataStatus = 'Price data is old, refresh recommended.';
  }

  response.send(
    timeSinceRefresh + ' Minutes Since Last API Refresh. ' + dataStatus
  );
}

exports.loadCXItemDataFromFile = loadCXItemDataFromFile;
