const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const path = require('path');

const prjRoot = path.join(__dirname, '..');

module.exports = merge(baseConfig, {

  devtool: 'source-map',

  devServer: {
    historyApiFallback: true,
    contentBase: [path.join(prjRoot, 'public'), path.join(prjRoot, 'node_modules')],
    compress: true
  },
});
