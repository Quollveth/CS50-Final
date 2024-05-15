const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const pages = [
  './src/index',
  './src/pages/login',
  './src/pages/register'
]

const generateHTMLPlugins = () => {
  const arr = [];
  
  pages
   .map(page => page + '.html')
   .forEach(page => {
      arr.push(
        new HtmlWebpackPlugin({
          template:page,
          filename:page.substring(page.lastIndexOf('/')+1)
        })
      )
   })
  return arr;
};

const generateEntries = () => {
  const obj = {};
  pages.forEach(page => {
    console.log()
    obj[page.substring(page.lastIndexOf('/')+1)] = page+'.ts';
  })
  return obj;
}

module.exports = {
  entry: generateEntries(),
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
        use: ['ts-loader'],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/')
  },
  plugins: [

  ].concat(generateHTMLPlugins())
};
