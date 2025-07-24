const path = require('node:path');
const baseConfig = require('./webpack.config.babel');

const port = 24011;
const publicPath = `http://localhost:${port}/`;

module.exports = {
  ...baseConfig,
  devtool: 'eval-source-map',
  devServer: {
    port,
    devMiddleware: {
      publicPath,
    },
    compress: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    static: {
      directory: path.resolve(__dirname),
      index: 'dev.html',
      watch: true,
    },
  },
};
