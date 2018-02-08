const compression = require('compression');
const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();

var sslRedirect = function(environments, status) {
  environments = environments || ['production'];
  status = status || 302;
  return function(req, res, next) {
    if (environments.indexOf(process.env.NODE_ENV) >= 0 && req.headers['x-forwarded-proto'] != 'https')
      res.redirect(status, 'https://www.' + req.hostname + req.originalUrl);
    else next();
  }
};

app.use(sslRedirect());
app.use(compression());
app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/public'));
app.use('/scripts', express.static(__dirname + '/node_modules/popper.js/dist/umd'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build/index.html'))
});

app.listen(port);
console.info("Server started on port " + port);
