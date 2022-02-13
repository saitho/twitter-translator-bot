const path = require("path");

module.exports = {
  mode: process.NODE_ENV || "development",
  entry: "./src",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  node: {
    __dirname: false
  },
  experiments: {
    topLevelAwait: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [{ loader: "file-loader" }]
      },
      {
        test: /\.node/i,
        use: [
          { loader: './custom-node-loader.js' },
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
          // replace paths: /home/mario/Workspace/synclair/node_modules/**/*.node => *,node
        ]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
