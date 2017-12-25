const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry:[
        './entry.js'
    ],
    output:{
        path:path.join(__dirname, './dist'),
        filename: "bundle.js",
        publicPath:'/'
    },
    devServer:{
        inline:true,
        port:3000
    },
    module:{
        loaders:[
            {
                test:/\.js?$/,
                loader:'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.less/,
                loader: 'style-loader!css-loader!less-loader'
            },
            {
　　　　　　     test: /\.(png|jpg|gif)$/,
　　　　　　     loader: "file-loader?name=images/[hash:8].[name].[ext]"
    　　　　 }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            template:'./index.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        modules: [path.resolve(__dirname,'node_modules')]
    }
};