var app = require('express')();
var cors = require('cors');
var request = require('request');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var _ = require('lodash');

app.use(cors());
server.listen(8889);

var market = {
  'list': {
    options: {
      url: 'https://api.bitcoinaverage.com/exchanges/USD',
      method: 'GET'
    }
  }
};

var market_list = function(count, cb) {
  request(market.list.options, function(error, response, body) {
    if (body === '') {
      console.log('empty', count);
      setTimeout(function(){
         market_list(count, cb);
      }, 1000);
    } else {
      cb(body);
    }
  });
};

var jsonfile = require('jsonfile');
var configs = __dirname + '/etc/exchanges.json';
var exchange_get = function(name, cb) {
  try {
    var exchange = require('./exchanges/' + name);
    
    jsonfile.readFile(configs, function(err, obj) {
      var config = _.filter(obj.exchanges, {name: 'bitfinex'})[0];
      exchange.get(config, function(str) {
        cb(str);
      });
    });
  //*
  } catch(e) {
    cb('null');
  };
  //*/
};

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/market/list', function (req, res) {
  market_list(-1, function(str){
    res.setHeader('Content-Type', 'application/json');
    res.send(str);
  });
});

app.get('/exchange/:name', function (req, res) {
  var name = req.params.name;
  exchange_get(name, function(str){
    res.setHeader('Content-Type', 'application/json');
    res.send(str);
  });
});

var count = 0;
var timer = {};
io.on('connection', function (socket) {
  socket.on('start_feeding', function () {

    timer[socket.id] = setInterval(function() {
      console.log(socket.id, 'conn', count++);
      market_list(count, function(str){
        try {
          if (str !== '') {
            socket.emit('market', { payload: JSON.parse(str) });
          }
        } catch(e) {};
      });
    }, 1000*30);
  });

  socket.on('disconnect', function() {
    console.log('Got disconnect!', socket.id);
    clearTimeout(timer[socket.id]);
  });

  socket.on('my other event', function (data) {
    console.log(data);
  });
});
