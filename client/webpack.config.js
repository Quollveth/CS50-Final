const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

const pages = [
  './src/pages/index',
  './src/pages/login',
  './src/pages/register'
]

const getPageName = (path) => path.substring(path.lastIndexOf('/')+1);
const removeExtension = (path) => path.substring(0,path.lastIndexOf('.'));

const generateHTMLPlugins = () => {
  const arr = [];

  pages
   .map(page => page + '.html')
   .forEach(page => {
      arr.push(
        new HtmlWebpackPlugin({
          template:'src/template.html',
          filename:getPageName(page),
          templateParameters: {
            title: 'Whiteboard|' + removeExtension(getPageName(page)),
            content: fs.readFileSync(`src/pages/${getPageName(page)}`),
            sourceFile: `<script src="${removeExtension(getPageName(page))}.js"></script>`,
          },
          chunks:[]
        })
      )
   })
  return arr;
};

const generateEntries = () => {
  const obj = {};
  pages.forEach(page => {
    console.log()
    obj[getPageName(page)] = page+'.ts';
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
    path: path.resolve(__dirname, 'dist/'),
  },
  plugins: [

  ].concat(generateHTMLPlugins())
};
