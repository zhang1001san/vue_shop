<template>
  <div>
    <h2>首页</h2>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    methods: {
      logout: function () {
        window.sessionStorage.clear()
        this.$router.push('/login')
      }
    }
  }
</script>

<style scoped>

</style>
