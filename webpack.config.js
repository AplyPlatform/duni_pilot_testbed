// webpack.config.js
const path = require( 'path' );
module.exports = {
    context: __dirname,
    entry: './center/js/index.js',
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'home.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            }
        ]
    }
};