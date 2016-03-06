var Promise = require('promise');
var util = require('util');
var spawn = require('child_process').spawn;
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var tmp = require('tmp');
var fs = require('fs');

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function createTempFile() {

  return new Promise(function (resolve, reject) {

    tmp.file(function (err, path) {

      if (err) {

        reject(err);

      } else {

        resolve(path);

      }

    });

  });

}

function writeToFile(path, content) {

  return new Promise(function (resolve, reject) {

    fs.writeFile(path, content, function(err) {

      if (err) {

        reject(err);

      } else {

        resolve(path);

      }

    });

  });

}

app.post('/api/v1/alk/run', function(req, res, next) {

  console.log('[AO] > POST request');

  createTempFile()
  .then(function(path) {

    console.log('Got temp path');

    return writeToFile(path, req.body.code);

  })
  .then(function(path) {

    console.log('Wrote to path ', path);

    console.log('Getting output to file', path, req.body.params);

    return getExecutableOutput(path, req.body.params);

  })
  .then(function(response) {

    return res.send(response);

  });

  function getExecutableOutput(path, parameters) {

    return new Promise(function(resolve, reject) {

      var response = '';

      var shell = spawn('./execute_krun.sh', [path, parameters]);

      shell.stdout.on('data', function(data) {
        response = response.concat(data.toString());
      });

      shell.stderr.on('data', function(data) {
        response = response.concat(data.toString());
      });

      shell.on('exit', function(data) {
        console.log('Response', response);

        resolve(response);
      });

    });

  }

});

app.listen(app.get('port'), function() {
  console.log('[AO] > Listening on', app.get('port'));
});
