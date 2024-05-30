const PROJ_NAME = 'Dashboard';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const CopyPlugin = require("copy-webpack-plugin");

const pages = [
  './src/scripts/index',
  './src/scripts/login',
  './src/scripts/register',
]

const getPageName = (path) => path.substring(path.lastIndexOf('/')+1);
const removeExtension = (path) => path.substring(0,path.lastIndexOf('.'));
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

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
            title: `${PROJ_NAME} | ` + capitalize(removeExtension(getPageName(page))),
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
  // Add entries for TypeScript files in the components folder
  const componentFiles = fs.readdirSync('./src/components').filter(file => file.endsWith('.ts'));
  componentFiles.forEach(file => {
    const componentName = path.basename(file, '.ts');
    obj[`components/${componentName}`] = `./src/components/${file}`;
  });
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
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/components/*.html", to: "components/[name].[ext]" },
      ],
    }),
  ].concat(generateHTMLPlugins())
};
