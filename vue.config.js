const { defineConfig } = require('@vue/cli-service')
let publicPath = ''
if (process.env.APP_ENV === 'production') {
  publicPath = '/pa-id-finder/'
}
if (process.env.APP_ENV === 'development') {
  publicPath = '/'
}
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: publicPath
})