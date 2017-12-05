const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: './app/index.html',
  filename: 'index.html',
  inject: 'head'
});

var ScriptExtHtmlWebpackPluginConfig = new ScriptExtHtmlWebpackPlugin({
  defaultAttribute: 'async'
});

module.exports = {
  entry: './app/index.js',

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  output: {
    filename: 'scripts/transformed.js',
    path: __dirname + '/build',
    publicPath: '/'
  },

  plugins: [HTMLWebpackPluginConfig, ScriptExtHtmlWebpackPluginConfig],
};