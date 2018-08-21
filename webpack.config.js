const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const options = {
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'src')
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env', 'react']
            }
          }
        ]
      }
    ]
  },
  entry: {
    bundle: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js'
  },
  plugins: [
    new CopyWebpackPlugin([
      'node_modules/bulma/css/bulma.min.css'
    ])
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    historyApiFallback: true,
    port: 8080
  }
}

module.exports = options
