const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const path = require('path');

prjRoot = path.join(__dirname, '..');

module.exports = merge(baseConfig, {

  devtool: 'eval',

  devServer: {
    contentBase: [path.join(prjRoot, 'public'), path.join(prjRoot, 'node_modules')],
    compress: true
  },
});