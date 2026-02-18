const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// If deploying to GitHub Pages project site, set PUBLIC_URL="/<repo-name>/"
// Example: PUBLIC_URL="/citizenship-quiz-webpack-ts/"
const PUBLIC_URL = process.env.PUBLIC_URL || "/";

module.exports = (env, argv) => {
  const isProduction = argv && argv.mode === "production";
  const PUBLIC_URL_RESOLVED = isProduction ? "/Canada-Citizenship-Exam/" : PUBLIC_URL;

  return {
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "bundle.[contenthash].js",
      publicPath: PUBLIC_URL_RESOLVED,
      clean: true
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: { loader: "ts-loader", options: { transpileOnly: true } },
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        publicPath: PUBLIC_URL_RESOLVED
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "public")
      },
      historyApiFallback: true,
      port: 5173,
      open: true
    }
  };
};
