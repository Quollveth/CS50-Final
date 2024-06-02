const path = require('path');
const dotenv = require('dotenv');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');
const InlineSourceWebpackPlugin = require('inline-source-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

//// Load environment variables
const env = dotenv.config({ path: path.resolve(__dirname, '../.env') });
if (!env) {
  throw new Error('No .env file found');
}
const PROJ_NAME = env.parsed.PROJ_NAME;

//// Helper functions
const getPageName = (path) => path.substring(path.lastIndexOf('/')+1);
const removeExtension = (path) => path.substring(0,path.lastIndexOf('.'));
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)


//// Get all pages
const pageFiles = fs.readdirSync('./src/pages').filter(file => file.endsWith('.html'));
const pages = pageFiles.map(page => removeExtension(page));

//// Get all components
const componentFiles = fs.readdirSync('./src/components').filter(file => file.endsWith('.html'));
const components = componentFiles.map(component => removeExtension(component));

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


//// Generate HTML plugin instances for each component
const generateComponentHTMLPlugins = () => {
  const arr = [];

  components
   .map(component => component + '.html')
   .forEach(component => {
      arr.push(
        new HtmlWebpackPlugin({
          template:'src/component-template.html',
          filename: `components/${component}`,
          inject: false,
          templateParameters:{
            componentName: capitalize(removeExtension(component)),
            componentContent: fs.readFileSync(`src/components/${removeExtension(component)}.html`),
            componentSource: `<script inline inline-asset="${removeExtension(component)}.js" inline-asset-delete></script>`
          }
        })
      )
      
    })
  return arr;
};


//// Generate all entrypoints
const generateEntries = () => {
  const obj = {};
  // Entries for pages
  pages.forEach(page => {
    obj[getPageName(page)] = `/src/scripts/${page}.ts`;
  })

  // Entries for components
  components.forEach(component => {
    obj[`components/${component}`] = `/src/components/${component}.ts`;
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
    path: path.resolve(__dirname, 'dist')
  },

  // Plugins
  plugins: [
    new InlineSourceWebpackPlugin({
      compress: true,
      noAssetMatch: 'warn'
    })
  ]
  .concat(generateHTMLPlugins())
  .concat(generateComponentHTMLPlugins())
};
