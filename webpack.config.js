const path = require('path');

// rope 主程序
module.exports = {
  mode: 'production',
  // mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './example/lib'),
    filename: 'rope.min.js'
  }
};

// rope benchmark
// module.exports = {
//   mode: 'production',
//   // mode: 'development',
//   entry: './benchmark/main.js',
//   output: {
//     path: path.resolve(__dirname, './benchmark/dist'),
//     filename: 'rope-bench-mark.js'
//   }
// };