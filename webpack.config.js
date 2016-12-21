// var webpack = require('webpack');
var path = require('path');

var DIST_DIR = path.resolve(__dirname, 'src/web/dist');
var APP_DIR = path.resolve(__dirname, 'src/web/app');

var config = {
    entry: path.resolve(APP_DIR, 'index.jsx'),
    output: {
        path: DIST_DIR,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: APP_DIR,
                loaders: ['babel']
            }
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // })
    ]
};

module.exports = config;
