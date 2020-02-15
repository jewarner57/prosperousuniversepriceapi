const express = require('express');
const scraper = require('./scraper.js');
let CXData;
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
let server = app.listen(port, started);

function loadCXItemDataFromFile() {
  let rawdata = fs.readFileSync('./CXItemInfo.json');
  CXData = JSON.parse(rawdata);
}

function getTimeSinceRefresh() {
  let dateNow = new Date();
  let refreshDate = new Date(CXData.refreshDate);
  //Math.round(n * 10) / 10
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

  if (timeSinceRefresh >= 60) {
    scraper.getCXPriceData();
    response.send('Update has started.');
  } else {
    response.send(
      'Server refresh cooldown active. ' +
        (60 - timeSinceRefresh) +
        ' minutes remaining until server refresh avaliable'
    );
  }
}

app.get('/time-since-refresh', timeSinceRefresh);

function timeSinceRefresh(request, response) {
  response.send(getTimeSinceRefresh() + ' Minutes Since Last API Refresh');
}

exports.loadCXItemDataFromFile = loadCXItemDataFromFile;
