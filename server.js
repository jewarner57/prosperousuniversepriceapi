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

function started() {
  console.log('Server listening on port: ' + port);
  loadCXItemDataFromFile();
}

app.get('/', function(req, res) {
  res.send(
    JSON.stringify({
      Route_Help: ': Full Price List /cxdata'
    })
  );
});

app.get('/cxdata/:exchange/:item', getItemByAbrev);

function getItemByAbrev(request, response) {
  response.send(
    CXData[request.params.exchange][request.params.item.toUpperCase()]
  );
}

app.get('/cxdata', sendFullItemList);

function sendFullItemList(request, response) {
  response.send(CXData);
}

app.get('/refresh-price-data', refreshPriceData);

function refreshPriceData(request, response) {
  scraper.getCXPriceData();
  response.send('Update has started.');
}

app.get('/time-of-last-refresh', timeOfRefresh);

function timeOfRefresh(request, response) {
  response.send(CXData.refreshDate);
  console.log(CXData.refreshDate);
}

exports.loadCXItemDataFromFile = loadCXItemDataFromFile;
