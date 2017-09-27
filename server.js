const compression = require('compression');
const express = require('express');
const path = require('path');
const port = process.env.PORT || 8080;
const app = express();

app.use(compression());
app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/public'));
app.use('/styles', express.static(__dirname + '/node_modules/react-bootstrap-table/dist'));
app.use('/styles', express.static(__dirname + '/node_modules/toastr/build'));
app.use('/styles', express.static(__dirname + '/node_modules/rc-slider/dist'));
app.use('/styles', express.static(__dirname + '/node_modules/rc-tooltip/assets'));


app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build/index.html'))
});

app.listen(port);
console.info("Server started on port " + port);
