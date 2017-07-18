var path = require('path');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

var HTMLWebpackPLuginConfig = new HTMLWebpackPlugin({
  template: __dirname + '/app/index.html',
  filename: 'index.html',
  inject: 'body'
});

var ScriptExtHtmlWebpackPluginConfig = new ScriptExtHtmlWebpackPlugin({
  defaultAttribute: 'async'
});

module.exports = {
  entry: __dirname + '/app/index.js',

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

  plugins: [HTMLWebpackPLuginConfig, ScriptExtHtmlWebpackPluginConfig],

  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    historyApiFallback: true
  }
};
