module.exports = {
    entry: "./scripts/main.jsx",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: "style!css!sass"
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"],
      }
    ]
  },
};