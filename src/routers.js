import Vue from 'vue'
import Router from 'vue-router'

// 导入login页面
import Login from './components/user/Login'
import Home from './components/home/Home'
import List from './components/user/UserList'
import Welcome from './components/home/Welcome'
import Roles from './components/permission/Roles'
import Rights from './components/permission/Rights'
import Goods from './components/goods/List'
import Params from './components/goods/Params'
import Cate from './components/goods/Cate'

Vue.use(Router)

// 路由跳转
var router = new Router({
    // 去除启动的Url后面的#号
    mode: 'history',
    routes: [
        // 没有地址的时候，默认进入登录页
        {path: '/', redirect: '/login'},
        // 登录页
        {path: '/login', component: Login},
        {
            // 首页
            path: '/home', component: Home, children: [
                // 首页默认路径
                {path: "/", component: Welcome},
                // 首页
                {path: "/welcome", component: Welcome},
                // 用户列表
                {path: '/users', component: List},
                // 角色列表
                {path: '/roles', component: Roles},
                // 权限列表
                {path: '/rights', component: Rights},
                // 商品列表
                {path: '/goods', component: Goods},
                // 商品列表 -> 分类参数
                {path: '/params', component: Params},
                // 商品分类
                {path: '/categories', component: Cate}
            ]
        },
    ]
})

/**
 * 全局前置守卫：当一个导航触发时，全局前置守卫按照创建顺序调用；守卫是异步解析执行，此时导航在所有守卫 resolve 完之前一直处于 等待中。
 *
 * @params to 即将要进入的目标 路由对象
 * @params from 当前导航正要离开的路由
 * @params next 钩子函数 放行
 */
router.beforeEach((to, from, next) => {
    // 如果是登录页面直接放行
    if (to.path === '/login') next()
    // 判断token
    let token = window.sessionStorage.getItem('token')
    if (!token) {
        // 跳转到登录页
        next('/login')
    }
    next()
})

export default router



