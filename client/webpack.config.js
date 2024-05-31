const PROJ_NAME = 'Dashboard';

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const CopyPlugin = require("copy-webpack-plugin");



//// Helper functions
const getPageName = (path) => path.substring(path.lastIndexOf('/')+1);
const removeExtension = (path) => path.substring(0,path.lastIndexOf('.'));
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)


//// Get all pages
const pageFiles = fs.readdirSync('./src/pages').filter(file => file.endsWith('.html'));
const pages = pageFiles.map(page => removeExtension(page));


//// Generate HTML plugin instances for each page
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


//// Generate all entrypoints
const generateEntries = () => {
  const obj = {};
  pages.forEach(page => {
    obj[getPageName(page)] = `/src/scripts/${page}.ts`;
  })
  return obj;
}


//// Actual build happens here
module.exports = {
  entry: generateEntries(),

  // Cache the build for faster rebuilds
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },

  // Use webpack loader, sass is built by itself
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

  // Output to dist folder, each page has its own js file
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },

  // Plugins
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/components/*.html", to: "components/[name].[ext]" },
      ],
    }),
  ].concat(generateHTMLPlugins())
};
