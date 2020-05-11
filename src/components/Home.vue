<template>
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../assets/heima.png">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse?'64px':'200px'">
        <!--折叠与展开-->
        <div class="toggle-button" @click="toggleCollapse">|||</div>

        <!--侧边栏菜单-->
        <el-menu
          unique-opened
          :router="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="activePath"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#4097ff">
          <!--一级菜单-->
          <el-submenu v-for="menu in  menuList" :key="menu.id" :index="menu.id+''">
            <!--一级菜单模板区域-->
            <template slot="title">
              <!--图标-->
              <i :class="iconsObj[menu.id]"></i>
              <!--文本-->
              <span>{{menu.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item
              @click="saveNavState(menuItem.path)"
              v-for="menuItem in menu.children" :key="menuItem.id" :index="menuItem.path">
              <template slot="title">
                <!--图标-->
                <i class="el-icon-menu"></i>
                <!--文本-->
                <span>{{menuItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>

      </el-aside>
      <!--右侧内容主体-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  export default {
    name: 'Home',
    data () {
      return {
        /* 菜单 */
        menuList: [],
        iconsObj: {
          125: 'iconfont icon-user',
          103: 'iconfont icon-3702mima',
          101: 'iconfont icon-shangpin',
          102: 'iconfont icon-danju',
          145: 'iconfont icon-baobiao'
        },
        /* 是否折叠 */
        isCollapse: false,
        /* 激活的菜单 */
        activePath: ''
      }
    },
    created () {
      // 初始化菜单
      this.getMenuList()
      // 设置激活菜单
      this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
      logout: function () {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      async getMenuList () {
        const { data: result } = await this.$http.get('menus')
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        this.menuList = result.data
        // this.activePath = this.menuList[0].path
      },
      toggleCollapse () {
        // 切换菜单的折叠与展开
        this.isCollapse = !this.isCollapse
      },
      saveNavState (activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      }
    }
  }
</script>

<style lang="less" scoped>

  .home-container {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    color: #ffffff;
    align-items: center;
    font-size: 20px;
    padding-left: 0;

    > div {
      display: flex;
      align-items: center;

      span {
        margin-left: 15px;
      }
    }
  }

  .el-aside {
    background-color: #333744;

    .el-menu {
      border-right: none;
    }
  }

  .el-main {
    background-color: #eaedf1;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #ffffff;
    text-align: center;
    cursor: pointer;
    letter-spacing: 0.2em;
  }
</style>
