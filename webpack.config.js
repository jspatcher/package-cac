const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
const config = {
  entry: {
    index: './src/index.ts',
    "index.jspatpkg": './src/index.jspatpkg.ts',
    // "index.jsdsppkg.main": './src/index.jsdsppkg.main.ts',
    // "index.jsdsppkg.aw": './src/index.jsdsppkg.aw.ts'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  node: {
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: "",
    libraryTarget: 'commonjs',
    chunkFilename: 'js/[chunkhash].js'
  },
  module: {
    rules: [{
      test: /\.(ts|js)x?$/,
      use: {
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2017'
        }
      },
      exclude: /node_modules/
    }, {
      test: /\.txt$/,
      type: "asset/source"
    }]
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
  // watch: true,
  watchOptions: {
    ignored: /node_modules/
  }
};
module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    config.devtool = 'source-map';
    config.output.filename = '[name].js';
  }
  if (argv.mode === 'production') {
    config.devtool = 'source-map';
    config.output.filename = '[name].min.js';
  }
  return config;
};