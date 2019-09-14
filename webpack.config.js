
const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: {
                    loader: "css-loader"
                }
            },
            {
                test: /\.svg$/,
                use: {
                    loader: "svg-inline-loader"
                }
            },
            {
                test: /\.worker\.js$/,
                use: { loader: 'worker-loader' }
            },
            {
                test: /\.(woff(2)?|ttf|eot|png|jpg|gif)$/i,
                use: { loader: 'url-loader' }
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        })
    ],
    output: {
        filename: '[name].js?t=' + new Date().getTime(),
        // chunkFilename: '[name]-chunk.js?t=' + new Date().getTime(),
        // publicPath: './',
        path: path.resolve(__dirname, 'dist')
    }
};