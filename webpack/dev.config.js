const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const prjRoot = path.join(__dirname, '..');

const styleLintPluginConfig = new StyleLintPlugin({
  syntax: 'scss',
  emitErrors: false
});

module.exports = merge(baseConfig, {

  devtool: 'source-map',
  plugins: [styleLintPluginConfig],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            emitWarning: true,
            fix: true,
          }
        }
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    contentBase: path.join(prjRoot, 'public'),
    compress: true,
    stats: 'minimal'
  },
});
