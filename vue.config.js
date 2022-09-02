let publicPath = ''
if (process.env.APP_ENV === 'production') {
  publicPath = '/pa-id-finder/'
}
if (process.env.APP_ENV === 'staging') {
  publicPath = '/'
}
module.exports = {
  publicPath: publicPath
}