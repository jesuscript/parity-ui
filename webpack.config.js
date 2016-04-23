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
  resolve:{
    extensions: ["", ".webpack.js", ".web.js", ".js", ".coffee"]
  },
  resolveLoader: { root: path.join(__dirname, 'node_modules') },
  devServer: {
    //contentBase: "",
    publicPath: "http://localhost:8080/build/"
  },
  module: {
    loaders: [
      {
        test: /\.js$|.jsx$/,
        loader: 'babel-loader',
        query: {
          presets: ['react']
        }
      },
      { test: /\.coffee$/, loader: "coffee-loader" },
      { test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/, loader : 'file-loader' },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.less$/, loader: "style!css!less" },
      { test: /\.json$/, loader: "json-loader" }
    ]
  },
  externals: {
    electron: 'require("electron")',
    remote: 'require("remote")'
  }
};
