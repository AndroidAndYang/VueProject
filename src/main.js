import Vue from 'vue'
import App from './App.vue'
// 导入路由规则
import router from "./routers";
// 导入element-ui
import ElementUI, {Message} from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
// 使用ElementUi
Vue.use(ElementUI)
// 树形表格
import TableTree from 'vue-table-with-tree-grid'
Vue.component('tree-table', TableTree)

// 字体图标Css
import './assets/fonts/iconfont.css';
// 根css
import './assets/global/global.css';

// 网络库
import axios from 'axios';

// 设置全局的base_url
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// 请求拦截器
axios.interceptors.request.use(function (config) {
    // 添加Token
    let token = sessionStorage.getItem("token")
    if (token != null && token.length > 0) {
        config.headers = {
            'Authorization': token
        }
    }
    return config;
})

// 相应拦截器，对请求结构返回的数据进行data获取
axios.interceptors.response.use(function (response) {
    return response.data;
})

// 定义axios对象
Vue.prototype.$retrofit = axios

/**
 * 全局消息提示
 *
 * Message 是 ElementUI中的组件库
 */
Vue.prototype.$toast = Message

/**
 * 全局提示框
 * @param title 标题
 * @param message 内容
 * @param click 确认点击
 */
Vue.prototype.showDialog = function (title, message, click) {
    this.$alert(message, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(function () {
        // 确认点击回调
        click()
    });
}

// 时间转换
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false
new Vue({
    render: h => h(App),
    router
}).$mount('#app')
