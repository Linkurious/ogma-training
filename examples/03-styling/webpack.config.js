const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  module: {
    rules: [{
      test: /\.css$/i,
      use: ['style-loader', 'css-loader'],
    }, {
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [
        'file-loader',
      ],
    }, {
      test: /\.svg$/,
      loader: 'svg-inline-loader'
    }]
  },
  entry: './src/index.js',
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [new HtmlWebpackPlugin({
    template: 'index.html',
    title: "Ogma visualization"
  }), new CopyPlugin({
    patterns: [
      { from: 'src/static', to: 'dist' }
    ]
  }),],
  devServer: {
    contentBase: '.',
    port: 9000
  }
};
