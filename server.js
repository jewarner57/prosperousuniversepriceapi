const scraper = require('./scraper.js');

const express = require('express');

const app = express();

const port = process.env.PORT || 3000;

let data = scraper.getCXPriceData(startServer);

let server;

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

app.get('/cxdata', sendCXData);

async function sendCXData(request, response) {
  response.json(await data);
}

exports.startServer = startServer;
