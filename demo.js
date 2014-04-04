var mongoose             = require('mongoose');
var MongooseRattlePlugin = require('mongoose-rattle-plugin');
var fixtures             = require('pow-mongoose-fixtures');

mongoose.connect('mongodb://127.0.0.1:27017/test', {}, function (err) {
  if (err) throw(err);
});

var Media = mongoose.model("Media", new mongoose.Schema().plugin(MongooseRattlePlugin));
var User  = mongoose.model("User", new mongoose.Schema({email: String}));

fixtures.load(__dirname + '/demo-fixtures.js');

var express = require('express');
var app     = express();

app.use('/static', express.static(__dirname));
app.use('/static', function(req, res, next) {
  res.send(404); // If we get here then the request for a static file is invalid
});

app.use(express.logger());     // Log requests to the console
app.use(express.bodyParser()); // Extract the data from the body of the request - this is needed by the LocalStrategy authenticate method

app.all('/*', function(req, res) {
  res.sendfile('demo.html', { root: __dirname });
});

// Start up the server on the port specified in the config
var server = app.listen(80, function() {
  console.log('Listening on port %d', server.address().port);
});
