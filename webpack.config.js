const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

var HTMLWebpackPLuginConfig = new HTMLWebpackPlugin({
  template: __dirname + '/app/index.html',
  filename: 'index.html',
  inject: 'head'
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
    historyApiFallback: {
      rewrites: [
        {from: '/styles/react-bootstrap-table-all.min.css', to: '/react-bootstrap-table/dist/react-bootstrap-table-all.min.css'},
        {from: '/styles/toastr.min.css', to: '/toastr/build/toastr.min.css'},
        {from: '/styles/rc-slider.min.css', to: '/rc-slider/dist/rc-slider.min.css'},
        {from: '/styles/bootstrap.css', to: '/rc-tooltip/assets/bootstrap.css'},
      ],
    },
    contentBase: [path.join(__dirname, 'public'), path.join(__dirname, 'node_modules')],
    compress: true
  }
};
