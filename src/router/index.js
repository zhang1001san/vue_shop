import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/authority/Rights'
import Roles from '../components/authority/Roles'
import Categories from '../components/goods/Categories'
import Params from '../components/goods/Params'
import GoodsList from '../components/goods/GoodsList'
import AddGoods from '../components/goods/AddGoods'
import Orders from '../components/orders/Orders'
import NotFound from '../components/other/NotFound'

Vue.use(VueRouter)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Categories },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: AddGoods },
      { path: '/orders', component: Orders }
    ]
  },
  { path: '*', component: NotFound }

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
