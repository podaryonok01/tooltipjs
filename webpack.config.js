const path = require("path");

const { isReleaseVersion } = require("./git-functions");

const release = isReleaseVersion();

module.exports = {
  target: ["web", "es5"],
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "./dist"),
    library: { type: "umd", name: "tooltipjs"},
    filename: "index.js"
  },
  devtool: release ? undefined : "eval",
  mode: release ? "production" : "development",
  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /\.useable\.scss/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "sass-loader" }
        ]
      },
      {
        test: /\.(js|ts)?$/,
        exclude: /(node_modules)/,
        use: [{ loader: "babel-loader" }]
      }
    ]
  },
  externals: {
    "intersection-observer": { root: "intersection-observer", commonjs2: "intersection-observer", commonjs: "intersection-observer"  },
    "resize-observer-polyfill": { root: "resize-observer-polyfill", commonjs2: "resize-observer-polyfill", commonjs: "resize-observer-polyfill"  },
  },
  resolve: {
    extensions: [".ts", "*", ".js"]
  }
};
