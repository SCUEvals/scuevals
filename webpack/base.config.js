const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: './app/index.html',
  filename: 'index.html',
  inject: 'head'
});

const ScriptExtHtmlWebpackPluginConfig = new ScriptExtHtmlWebpackPlugin({
  defaultAttribute: 'async'
});

const ExtractSass = new ExtractTextPlugin({
  allChunks: true,
  filename: "[name].[contenthash].css",
});

module.exports = {
  entry: './app/index.js',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        }
      },
      {
        test: /\.scss$/,
        use: ExtractSass.extract({
          use: [{
            loader: "css-loader", options: {
              sourceMap: true
            }
          }, {
            loader: "sass-loader", options: {
              sourceMap: true
            }
          }],
          fallback: 'style-loader',
        })
      }
    ]
  },

  output: {
    filename: 'scripts/transformed.js',
    path: path.join(__dirname, '..', 'build'),
    publicPath: '/'
  },

  plugins: [HTMLWebpackPluginConfig, ScriptExtHtmlWebpackPluginConfig, ExtractSass],
};