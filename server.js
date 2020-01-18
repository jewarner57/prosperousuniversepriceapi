const scraper = require('./scraper.js');

const express = require('express');

const app = express();

const port = 8000;

let data = scraper.getCXPriceData(startServer);

let server;

function startServer() {
  server = app.listen(port, started);
}

function started() {
  console.log('Server listening on port: ' + port);
}

app.get('/cxdata', sendCXData);

function sendCXData(request, response) {
  response.send(data);
  console.log(data);
}

exports.startServer = startServer;
