const scraper = require('./scraper.js');

const express = require('express');

const app = express();

const CXData = require('./CXItemInfo.json');

const port = process.env.PORT || 3000;

//let data = scraper.getCXPriceData(startServer);

let server;
startServer();

function startServer() {
  server = app.listen(port, started);
}

function started() {
  console.log('Server listening on port: ' + port);
}

app.get('/', function(req, res) {
  res.send(
    JSON.stringify({
      Hello: ' Exchange items and values can be found at /cxdata'
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

exports.startServer = startServer;
