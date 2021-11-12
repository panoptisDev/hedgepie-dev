require('@babel/register');
require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BugsnagBuildReporterPlugin, BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins');
const { version: APP_VERSION } = require('./package.json');
import MimoblTheme from './src/common/theme.json'
import CopyPlugin from 'copy-webpack-plugin'

const { NODE_ENV, CI, BUGSNAG_API_KEY, CI_COMMIT_BRANCH } = process.env;
const env = {
  APP_VERSION: `'${APP_VERSION}'`
};
Object.entries(process.env).forEach(([key, value]) => {
  if (/[A-Z_]*/.test(value) && value.length < 500 && !/^(npm_)|(CI_)/.test(key)) {
    env[key] = `'${value}'`;
  }
});

const isDev = NODE_ENV !== 'production';
const isDeployPipeline = CI_COMMIT_BRANCH === 'master' || CI_COMMIT_BRANCH === 'production'
const releaseStage = CI_COMMIT_BRANCH === 'production' ? 'production' : 'staging'
let publicPath = releaseStage === 'production' ? 'https://rubi.finance' : 'https://staging.rubi.finance'
if (isDev) {
  publicPath = ''
}

let bugsnagPlugins = [];
if (!isDev && isDeployPipeline) {
  bugsnagPlugins = [
    new BugsnagBuildReporterPlugin({
      apiKey: BUGSNAG_API_KEY,
      appVersion: APP_VERSION,
      releaseStage,
      sourceControl: {
        provider: 'gitlab',
        revision: process.env.CI_COMMIT_SHA,
        repository: 'https://gitlab.innovationup.stream/rubi.finance/rubi-finance-dev',
      },
    }, {
      path: path.resolve('.', '../..'),
    }),
    new BugsnagSourceMapUploaderPlugin({
      apiKey: BUGSNAG_API_KEY,
      appVersion: APP_VERSION,
      overwrite: true,
    })
  ];
}

module.exports = {
  watch: !CI && NODE_ENV !== 'production',
  mode: NODE_ENV,
  devtool: CI || NODE_ENV === 'production' ? 'source-map' : 'inline-source-map',
  entry: './src/index.js',
  output: {
    filename: '[name].[chunkhash:8].js',
    path: path.resolve(__dirname, 'www/js'),
    publicPath: `${publicPath}/js/`,
    /** Unique chunk names is how we break the cache for prod deploys */
    chunkFilename: '[id].[chunkhash].js',
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'
  },
  plugins: [
    ...bugsnagPlugins,
    // new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, 'www/index.html'),
      title: 'Rubi Finance',
      favicon: './src/favicon.ico',
      template: './src/template.ejs'
    }),
    new webpack.DefinePlugin({
      env,
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/images/"),
          to: path.resolve(__dirname, "www/img/"),
        },
      ]
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          'presets': [
            '@babel/preset-env',
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          'plugins': [
            ['@babel/plugin-transform-runtime', {
              'regenerator': true
            }],
            '@babel/plugin-syntax-dynamic-import',
            ['import', { 'libraryName': 'antd', 'libraryDirectory': 'es', 'style': true }],
            ['import', { 'libraryName': 'antd-mobile', 'libraryDirectory': 'es', 'style': 'css' }, 'antd-mobile']
          ],
        }
      },
      {
        test: /\.less$|\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                modifyVars: {
                  'primary-color': MimoblTheme.colors.primary,
                  'border-radius-base': MimoblTheme.cards.borderRadiusBase,
                  'card-radius': MimoblTheme.cards.borderRadiusBase,
                  'card-shadow': MimoblTheme.cards.shadow,
                  'link-hover-color': MimoblTheme.buttons.secondary.color,
                  'radio-button-bg': 'white',
                  'radio-button-checked-bg': '#8888888',
                  //'btn-default-bg': MimoblTheme.buttons.secondary['background-color'],
                  //'btn-default-color': MimoblTheme.buttons.secondary.color,
                  'radio-border-width': '0px',
                  'card-padding-base': '2rem',
                  'card-head-padding': '2rem',
                  'card-shadow': '0 1.5rem 4rem rgba(22,28,45,.1)!important',
                  //'border-width-base': '0px',
                },
                javascriptEnabled: true,
              },
            },
          },
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
          }
        ]
      },
      {
        test: /\.(gif|jpe?g|webp|png|ttf)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.png', '.jpg', '.webp'],
    alias: {
      common: path.resolve(__dirname, 'src/common'),
      pages: path.resolve(__dirname, 'src/pages'),
      hooks: path.resolve(__dirname, 'src/common/hooks'),
      generated: path.resolve(__dirname, 'src/generated'),
      components: path.resolve(__dirname, 'src/components'),
      context: path.resolve(__dirname, 'src/context'),
      abi: path.resolve(__dirname, 'src/abi'),
    },
    fallback: {
      "process": require.resolve("process"),
      "os": require.resolve("os-browserify/browser"),
      "https": require.resolve("https-browserify"),
      "http": require.resolve("stream-http"),
      "crypto": require.resolve("crypto-browserify"),
      "assert": require.resolve("assert"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
    }

  },
  devServer: {
    port: 9001,
    contentBase: 'www',
    hot: true,
    inline: true,
    disableHostCheck: true,
    historyApiFallback: {
      index: 'index.html',
    },
    compress: true,
    writeToDisk: true
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
  },
  ignoreWarnings: [/Failed to parse source map/]
};

