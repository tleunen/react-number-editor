var HtmlwebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './demo',
    output: {
        path: './build',
        filename: 'bundle.js'
    },
    devtool: 'sourcemap',
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader' },
            { test: /\.css$/, loader: 'style-loader!css-loader' }
        ]
    },
    plugins: [
        new HtmlwebpackPlugin({
            title: 'React Number Editor Demo'
        })
    ]
};
