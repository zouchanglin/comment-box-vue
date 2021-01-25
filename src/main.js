import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
import './assets/font/iconfont.css'

import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'https://comment.zouchanglin.cn/api/'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.headers.get['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.transformRequest = [function (data) {
  let src = ''
  for (const item in data) {
    src += encodeURIComponent(item) + '=' + encodeURIComponent(data[item]) + '&'
  }
  return src
}]
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
