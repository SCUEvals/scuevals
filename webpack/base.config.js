const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const htmlWebpackPluginConfig = new HTMLWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'head'
});

const scriptExtHtmlWebpackPluginConfig = new ScriptExtHtmlWebpackPlugin({
  defaultAttribute: 'async'
});

const extractStyle = new ExtractTextPlugin({
  filename: 'styles.min.css'
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


module.exports = {
  entry: './src/index.js',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            'presets': ['react', 'es2015', 'stage-0'],
            'plugins': [['react-css-modules',
              {
                'exclude': 'style.scss',
                'filetypes': {
                  '.scss': {
                    'syntax': 'postcss-scss'
                  }
                }
              }
            ]]
          }
        }
      },
      {
        test: /\.css$/,
        use: extractStyle.extract({
          use: [{
            loader: 'css-loader', options: cssLoaderOptions
          }],
          fallback: 'style-loader',
        })
      },
      {
        test: /\.css$/,
        resourceQuery: /global/,
        use: extractStyle.extract({
          use: [{
            loader: 'css-loader', options: cssGlobalLoaderOptions
          }],
          fallback: 'style-loader',
        })
      },
      {
        test: /\.scss$/,
        use: extractStyle.extract({
          use: [{
            loader: 'css-loader', options: cssLoaderOptions
          }, {
            loader: 'sass-loader', options: {
              sourceMap: true
            }
          }],
          fallback: 'style-loader',
        })
      },
      {
        test: /\.scss$/,
        resourceQuery: /global/,
        use: extractStyle.extract({
          use: [{
            loader: 'css-loader', options: cssGlobalLoaderOptions
          }, {
            loader: 'sass-loader', options: {
              sourceMap: true
            }
          }],
          fallback: 'style-loader',
        })
      }
    ]
  },

  output: {
    filename: 'bundle.min.js',
    path: path.join(__dirname, '..', 'build'),
    publicPath: '/'
  },

  plugins: [htmlWebpackPluginConfig, scriptExtHtmlWebpackPluginConfig, extractStyle],
};
