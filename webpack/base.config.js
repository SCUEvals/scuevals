const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

const htmlWebpackPluginConfig = new HTMLWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'head'
});

const scriptExtHtmlWebpackPluginConfig = new ScriptExtHtmlWebpackPlugin({
  defaultAttribute: 'async'
});

const extractStyle = new ExtractTextPlugin({
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
        oneOf: [{
          resourceQuery: /global/,
          use: extractStyle.extract({
            use: [{
              loader: 'css-loader', options: cssGlobalLoaderOptions
            }],
            fallback: 'style-loader',
          })
        }, {
          use: extractStyle.extract({
            use: [{
              loader: 'css-loader', options: cssLoaderOptions
            }],
            fallback: 'style-loader',
          })
        }],
      },
      {
        test: /\.scss$/,
        oneOf: [{
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
        }, {
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
        }]
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]'
      }
    ]
  },

  output: {
    filename: 'bundle.[hash].min.js',
    path: path.join(__dirname, '..', 'build'),
    publicPath: '/'
  },

  plugins: [htmlWebpackPluginConfig, scriptExtHtmlWebpackPluginConfig, extractStyle, styleLintPluginConfig],
};
