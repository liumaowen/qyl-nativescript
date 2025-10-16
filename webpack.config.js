const webpack = require('@nativescript/webpack');

module.exports = (env) => {
  webpack.init(env);

  webpack.chainWebpack((config) => {
    // 添加别名
    config.resolve.alias
      .set('@', webpack.Utils.project.getProjectFilePath('src'))
      .set('vue', 'nativescript-vue');

    // 配置Node.js polyfills - 彻底禁用以消除警告
    config.resolve.fallback = {
      "crypto": false,
      "url": false,
      "fs": false,
      "path": false,
      "os": false,
      "stream": false,
      "util": false,
      "buffer": false,
      "process": false,
      "http": false,
      "https": false,
      "zlib": false,
      "querystring": false
    };

    // 添加Vue文件处理
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
      .loader('vue-loader');

    // 添加Vue插件
    const { VueLoaderPlugin } = require('vue-loader');
    config.plugin('vue-loader').use(VueLoaderPlugin);
  });

  // 复制多语言文件
  webpack.Utils.addCopyRule('**/*.json');
  webpack.Utils.addCopyRule('src/locales/**/*');

  // 添加ignoreWarnings配置到最终配置
  const baseConfig = webpack.resolveConfig();

  baseConfig.ignoreWarnings = [
    /Failed to parse source map/,
    /Can't resolve 'crypto'/,
    /Can't resolve 'url'/,
    /Module not found: Error: Can't resolve 'crypto'/,
    /Module not found: Error: Can't resolve 'url'/
  ];

  return baseConfig;
};