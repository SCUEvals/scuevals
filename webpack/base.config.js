const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');

const defineAPIURL = new webpack.DefinePlugin({
  'API_URL': JSON.stringify(process.env.API_URL)
});

const htmlWebpackPluginConfig = new HTMLWebpackPlugin({
  template: './src/index.html',
  filename: './index.html',
  inject: 'head'
});

const scriptExtHtmlWebpackPluginConfig = new ScriptExtHtmlWebpackPlugin({
  defaultAttribute: 'defer'
});

const extractStyle = new MiniCssExtractPlugin({
  filename: 'styles.[hash].min.css'
});

const styleLintPluginConfig = new StyleLintPlugin({
  failOnError: false,
  syntax: 'scss',
  quiet: false
});

const cssLoaderOptions = {
  importLoaders: 1,
  modules: true,
  sourceMap: true,
  localIdentName: '[path]___[name]__[local]___[hash:base64:5]'
};

const cssGlobalLoaderOptions = {
  importLoaders: 1,
  sourceMap: true,
};

const postCSSLoaderOptions = {
  sourceMap: true,
  plugins: [require('autoprefixer')()]
};


module.exports = {
  entry: ['babel-polyfill', './src/index.jsx'],

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            'presets': ['react', 'es2015', 'stage-0'],
            'plugins': [['react-css-modules',
              {
                'filetypes': {
                  '.scss': {'syntax': 'postcss-scss'}
                }
              }
            ]]
          }
        }
      },
      {
        test: /\.css$/,
        oneOf: [{
          resourceQuery: /global/,
          use: [
            MiniCssExtractPlugin.loader,
            {loader: 'css-loader', options: cssGlobalLoaderOptions},
            {loader: 'postcss-loader', options: postCSSLoaderOptions}
          ]
        }, {
          use: [
            MiniCssExtractPlugin.loader,
            {loader: 'css-loader', options: cssLoaderOptions},
            {loader: 'postcss-loader', options: postCSSLoaderOptions}
          ]
        }],
      },
      {
        test: /\.scss$/,
        oneOf: [{
          resourceQuery: /global/,
          use: [
            MiniCssExtractPlugin.loader,
            {loader: 'css-loader', options: cssGlobalLoaderOptions},
            {loader: 'postcss-loader', options: postCSSLoaderOptions},
            {loader: 'sass-loader', options: {sourceMap: true}}
          ]
        }, {
          use: [
            MiniCssExtractPlugin.loader,
            {loader: 'css-loader', options: cssLoaderOptions},
            {loader: 'postcss-loader', options: postCSSLoaderOptions},
            {loader: 'sass-loader', options: {sourceMap: true}}
          ]
        }]
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.jsx'],
  },

  output: {
    filename: 'bundle.[hash].min.js',
    publicPath: '/'
  },

  plugins: [
    defineAPIURL,
    htmlWebpackPluginConfig,
    scriptExtHtmlWebpackPluginConfig,
    extractStyle,
  ],
};
