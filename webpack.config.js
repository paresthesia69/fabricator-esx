const path = require('path');
const webpack = require('webpack');

/**
 * Define plugins based on environment
 * @param {boolean} isDev If in development mode
 * @return {Array}
 */
const getPlugins = (config) => {

  const plugins = [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({})
  ];

  const isDev = config.dev;

  if (isDev) {
    plugins.push(new webpack.NoEmitOnErrorsPlugin());
  } else {
    let uglifySettings = {minimize: true, sourceMap: false, compress: {warnings: false}};
    if (config.jsSourcemap) {
      uglifySettings = {
        minimize: false,
        sourceMap: config.jsSourcemap,
        compress: {drop_console: false, pure_funcs: ['console.log', 'console.warn']}
      };
    }
    plugins.push(new webpack.optimize.DedupePlugin());
    plugins.push(new webpack.optimize.UglifyJsPlugin(uglifySettings));
  }

  return plugins;
};

module.exports = (config) => {
  const devtoolConfig = (config.jsSourcemap) ? 'source-map' : false;
  return {
    entry: {
      'fabricator/scripts/f': config.scripts.fabricator.src,
      'toolkit/scripts/toolkit': config.scripts.toolkit.src,
      'toolkit/scripts/demo': config.scripts.demo.src,
      'toolkit/scripts/vendor': config.scripts.vendor.src
    },
    output: {
      path: path.resolve(__dirname, config.dest, 'assets'),
      filename: '[name].js'
    },
    devtool: devtoolConfig,
    resolve: {
      extensions: ['.js']
    },
    plugins: getPlugins(config),
    module: {
      rules: [
        {test: /(\.js)/, exclude: /(node_modules)/, use: ['babel-loader']},
        {test: /(\.jpg|\.png)$/, use: 'url-loader?limit=10000'},
        {test: /\.json/, use: 'json-loader'}
      ]
    }
  };
};
