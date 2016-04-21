var webpack = require("webpack"),
    path = require("path");

console.log(path.join(__dirname, 'node_modules'));

module.exports = {
  //context: __dirname + '/app',
  //entry: './js/entry.js',
  entry: './app/js/entry.js',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/build',
    publicPath: "http://localhost:8080/build/"
  },
  resolveLoader: { root: path.join(__dirname, 'node_modules') },
  devServer: {
    //contentBase: "",
    publicPath: "http://localhost:8080/build/"
  },
  module: {
    loaders: [
      {
        test: /\.js|.jsx$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  externals: {
    electron: 'require("electron")',
    remote: 'require("remote")'
  }
};
