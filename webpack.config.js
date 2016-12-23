var webpack = require('webpack');
var path = require('path');

var isProd = /^prod/i.test(process.env.NODE_ENV);

var WEB_DIR = path.resolve(__dirname, 'src/web');
var DIST_DIR = path.resolve(WEB_DIR, 'dist');
var APP_DIR = path.resolve(WEB_DIR, 'app');

var config = {
    entry: [
        path.resolve(APP_DIR, 'index.jsx')
    ],
    output: {
        path: DIST_DIR,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: APP_DIR,
                loader: 'babel'
            },
            {
                test: /\.less$/,
                loaders: ['style', 'css', 'less']
            },
            {
                test: /\.png$/,
                loader: "url?limit=100000"
            },
            {
                test: /\.jpg$/,
                loader: "file"
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url?limit=10000&mimetype=image/svg+xml'
            }
        ]
    },
    plugins: isProd ? [
        new webpack.optimize.UglifyJsPlugin({compress:{warnings:false}})
    ] : []
};

module.exports = config;
