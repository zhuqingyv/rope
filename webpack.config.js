const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, './lib'),
        filename: 'rope.js'
    },
    optimization: {
        minimizer: [
          new UglifyJsPlugin({
            test: /\.js(\?.*)?$/i,
            cache: true,
            parallel: true,
            extractComments: true
          }),
        ],
      },
};

// minify,
// uglifyOptions = {},
// test = /\.js(\?.*)?$/i,
// chunkFilter = () => true,
// warningsFilter = () => true,
// extractComments = false,
// sourceMap = false,
// cache = false,
// cacheKeys = defaultCacheKeys => defaultCacheKeys,
// parallel = false,
// include,
// exclude