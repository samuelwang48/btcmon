var crypto = require('crypto');
var _ = require('lodash');

module.exports = {
  get: function (conf, cb) {
    cb = cb || function() {};
    var url = conf.api;

/*
    var payload = {
      "request": "/v1/account_infos",
      "nonce": Date.now().toString()
    };
*/

    var payload = {
      "request": "/v1/balances",
      "nonce": Date.now().toString()
    };

    var
      request = require('request'),
      api_key = conf.key,
      api_secret = conf.secret;
    payload = new Buffer(JSON.stringify(payload))
      .toString('base64');

    var
      signature = crypto
      .createHmac("sha384", api_secret)
      .update(payload)
      .digest('hex'),
      headers = {
        'X-BFX-APIKEY': api_key,
        'X-BFX-PAYLOAD': payload,
        'X-BFX-SIGNATURE': signature
      },
      options = {
        //url: url + '/account_infos',
        url: url + '/balances',
        headers: headers,
        body: payload
      };
    request.post(options,
      function(error, response, body) {
        var payload = JSON.parse(body);
        var btc = _.filter(payload,
              {type: 'exchange', currency: 'btc'})[0];
        var usd = _.filter(payload,
              {type: 'exchange', currency: 'usd'})[0];
        var output = {
          exchange: {
            btc: {
              amount: btc.amount,
              available: btc.available
            },
            usd: {
              amount: usd.amount,
              available: usd.available
            }
          },
          raw: payload
        };
        cb(output);
    });

  }
};
