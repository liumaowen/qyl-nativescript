const webpack = require('@nativescript/webpack');

module.exports = (env) => {
  webpack.init(env);

  // 添加Vue支持
  webpack.chainWebpack((config) => {
    // 添加Vue文件处理
    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
      .loader('vue-loader');

    // 添加别名
    config.resolve.alias
      .set('@', webpack.Utils.project.getProjectFilePath('src'))
      .set('vue', 'nativescript-vue');

    // 添加Vue插件
    const { VueLoaderPlugin } = require('vue-loader');
    config.plugin('vue-loader').use(VueLoaderPlugin);

    // 处理.vue文件中的样式
    config.module
      .rule('vue-style')
      .test(/\.vue$/)
      .use('vue-style-loader')
      .loader('vue-style-loader');
  });

  // 复制多语言文件
  webpack.Utils.addCopyRule('**/*.json');
  webpack.Utils.addCopyRule('src/locales/**/*');

  return webpack.resolveConfig();
};