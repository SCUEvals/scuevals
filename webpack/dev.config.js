const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const path = require('path');

const prjRoot = path.join(__dirname, '..');

module.exports = merge(baseConfig, {

  devtool: 'eval',

  devServer: {
    historyApiFallback: {
      rewrites: [
        {from: '/scripts/popper.min.js', to: '/popper.js/dist/umd/popper.min.js'}
      ]
    },
    contentBase: [path.join(prjRoot, 'public'), path.join(prjRoot, 'node_modules')],
    compress: true
  },
});
