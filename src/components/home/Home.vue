<template>
  <el-container class="home-container">
    <el-header>
      <div class='logo'>
        <img src='../../assets/heima.png'/>
        <span>后台管理系统</span>
      </div>
      <el-button @click='logout()' type='info'>退出</el-button>
    </el-header>
    <el-container class="left-slide">
      <el-aside :width="toggle ?'60px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu background-color='#333744' text-color='#fff' active-text-color='#409EFF' :default-active="active"
                 :router="true" :collapse="toggle" :collapse-transition="false" unique-opened>

          <el-menu-item index="/welcome">
            <i class="iconfont icon-danju"></i>
            <span slot="title">首页</span>
          </el-menu-item>

          <!--  index用于点击显示高亮折叠展开，值需要一个字符串   -->
          <el-submenu :index="menuItem.id + ''" v-for="menuItem in menuList" :key="menuItem.id">
            <template slot='title'>
              <i :class='iconsObj[menuItem.id]'></i>
              <span>{{ menuItem.authName }}</span>
            </template>

            <el-menu-item :index="'/' + childrenItem.path" v-for="childrenItem in menuItem.children"
                          :key="childrenItem.id" @click="saveNavState('/' + childrenItem.path)">
              <template slot='title'>
                <i class='el-icon-menu'></i>
                <span>{{ childrenItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  // 生命周期方法
  created() {
    const activePath = window.sessionStorage.getItem("activePath")
    console.log(activePath, !activePath)
    if (activePath) {
      this.active = activePath
    }
    this.getMenuList()
  },
  data: function () {
    return {
      // 折叠展开
      toggle: false,
      // 每个权限列表对应的icon
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 菜单列表
      menuList: [],
      // 当前是那个激活
      active: "/welcome"
    }
  },
  methods: {
    // 菜单折叠
    toggleCollapse() {
      this.toggle = !this.toggle
    },
    // 退出
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取左侧菜单列表
    async getMenuList() {
      const res = await this.$retrofit.get("/menus")
      if (res.meta.status !== 200) {
        this.$toast.error("获取失败")
        return
      }
      this.menuList = res.data
    },
    // 菜单选择
    saveNavState(path) {
      this.active = path
      window.sessionStorage.setItem("activePath", path)
    }
  }
}
</script>

<style scoped>

.home-container {
  height: 100% !important;
}

/* 默认有左右艰巨 */
.el-header {
  display: flex;
  /* 子类垂直剧中 */
  align-items: center;
  /* 左右两边排列 */
  justify-content: space-between;
  padding-left: 0;
  color: white;
  background: #363D41;
}

.el-header .logo {
  margin-left: 20px;
  display: flex;
  align-items: center;
  text-align: center;
}

.el-header .logo span {
  font-size: 18px;
  padding-left: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}

.iconfont {
  margin-right: 10px;
}

.el-menu {
  border-right: none;
}

.el-aside {
  background: #333744;
}

.el-main {
  background: #E9EDF1;
}
</style>