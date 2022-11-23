const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const fileName = (ext) => `[name].${ext}`
const isDev = process.env.NODE_ENV === 'development'

const optimization = () => {
    const conf = {
        splitChunks: {
            chunks: "all"
        }
    }

    if (!isDev) {
        conf.minimizer = [
            new TerserPlugin(),
            new OptimizeCssAssetsPlugin()
        ]
    }

    return conf
}

const sccLoader = (extra) => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {},
        },
        "css-loader",
    ]
    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const jsLoader = () => {
    return [{
        loader: "babel-loader",
        options: {
            presets: ['@babel/preset-env']
        }
    }]
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main: './index.js',
    },
    output: {
        filename: fileName('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            '@models': path.resolve(__dirname, 'src/models'),
            '@': path.resolve(__dirname, 'src'),
        }
    },
    optimization: optimization(),
    devtool: isDev ? "source-map" : 'eval',
    devServer: {
        port: 4200,
        hot: isDev,
        static: {
            directory: path.join(__dirname, 'src'),
        },
    },
    plugins: [
        new HTMLWebpackPlugin({
            title: 'text editor',
            template: "./index.html",
            minify: {
                collapseWhitespace: !isDev
            }
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: fileName('css'),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: sccLoader("sass-loader")
            },
            {
                test: /\.css$/i,
                use: sccLoader(),
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                type: 'asset/resource',

            },
            {
                test: /\.(ttf|woff|woff2)$/,
                use: ['file-loader']
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: jsLoader()
            }
        ]
    }
}
