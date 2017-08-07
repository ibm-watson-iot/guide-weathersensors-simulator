const path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: {
    bundle: './client/react/main.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    publicPath: '/js/',
    filename: '[name].js',
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: ['node_modules'],
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules)/,
      loader: 'babel',
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader',
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }, {
      test: /\.svg$/,
      loader: 'babel!react-svg',
    }],
    // fix for using request
    noParse: /node_modules\/json-schema\/lib\/validate\.js/,
  },
  node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
  externals: {
    cheerio: 'window',
    'react/addons': true,
    'react/lib/ReactContext': true,
    'react/lib/ExecutionEnvironment': true,
  },
};
