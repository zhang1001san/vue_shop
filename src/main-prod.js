import Vue from 'vue'
import App from './App.vue'
import router from './router'
/* 导入字体图标 */
import './assets/fonts/iconfont.css'
/* 引入全局样式表 */
import './assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'

import VueQuillEditor from 'vue-quill-editor'

import NProgress from 'nprogress'

// 引入axios
import axios from 'axios'

// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求前拦截，统一设置token
// 在request 拦截器中，展示进度条NProgress . start()
axios.interceptors.request.use((config) => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 一定要返回
  NProgress.start()
  return config
})

// 在response 拦截器中，隐藏进度条NProgress.done()
axios.interceptors.response.use(function (response) {
  NProgress.done()
  return response
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
Vue.filter('dateFormat', function (originalVal) {
  const date = new Date(originalVal)

  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2, '0')
  const day = (date.getDate() + '').padStart(2, '0')

  const hour = (date.getHours() + '').padStart(2, '0')
  const minute = (date.getMinutes() + '').padStart(2, '0')
  const second = (date.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
