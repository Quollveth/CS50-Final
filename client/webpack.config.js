const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [
          'ts-loader',
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname,'dist/')
  },
  plugins: [
    new HtmlWebpackPlugin({
        hash: true,
        template: './src/index.html',
        filename: 'index.html',
        inject: 'body'
    })
  ]
};