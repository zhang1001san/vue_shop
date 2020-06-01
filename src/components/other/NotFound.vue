<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>404 NOT FOUND</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <el-alert
        center
        :closable="false"
        title="404 NOT FOUND"
        type="error">
      </el-alert>
    </el-card>

  </div>
</template>

<script>
  export default {
    name: 'NotFound'
  }
</script>

<style scoped>

</style>
