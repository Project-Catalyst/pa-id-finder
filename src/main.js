import Vue from 'vue'
import Buefy from "buefy"
import App from './App.vue'
import router from './router'
import store from './store'

import { i18n } from './plugins/i18n';
import './plugins/axios'
import "./plugins/buefy"

Vue.config.productionTip = false
Vue.use(Buefy);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
