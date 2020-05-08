import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'

Vue.use(VueRouter)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]
const router = new VueRouter({
  routes
})

// 挂载路由导航守卫，进行登录校验
router.beforeEach((to, from, next) => {
  // to将要访问的路径
  // from代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next()放行  强制跳转 next(' /login')
  if (to.path === '/login') {
    return next()
  }
  const token = window.sessionStorage.getItem('token')
  // 没有token,跳转登陆页
  if (!token) {
    return next('/login')
  }
  // 已经登陆，放行
  next()
})

export default router
