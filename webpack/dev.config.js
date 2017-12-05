const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const path = require('path');

prjRoot = path.join(__dirname, '..');

module.exports = merge(baseConfig, {

  devtool: 'eval',

  devServer: {
    historyApiFallback: {
      rewrites: [
        {from: '/styles/react-bootstrap-table-all.min.css', to: '/react-bootstrap-table/dist/react-bootstrap-table-all.min.css'},
        {from: '/styles/rc-slider.min.css', to: '/rc-slider/dist/rc-slider.min.css'},
        {from: '/styles/bootstrap.css', to: '/rc-tooltip/assets/bootstrap.css'},
        {from: '/styles/react-select.min.css', to: '/react-select/dist/react-select.min.css'}
      ],
    },
    contentBase: [path.join(prjRoot, 'public'), path.join(prjRoot, 'node_modules')],
    compress: true
  },
});