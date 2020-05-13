<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区域-->
    <el-card class="box-card">

      <el-table
        :data="rightsList"
        stripe
        border
        style="width: 100%">

        <el-table-column
          type="index"
          label="#">
        </el-table-column>

        <el-table-column
          prop="authName"
          label="权限名称">
        </el-table-column>
        <el-table-column
          prop="path"
          label="路径"
          >
        </el-table-column>
        <el-table-column
          prop="level"
          label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==='0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level==='1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

  </div>
</template>

<script>
  export default {
    name: 'Rights',
    data () {
      return {
        // 权限列表
        rightsList: []
      }
    },
    created () {
      this.getRightsList()
    },
    methods: {
      async getRightsList () {
        const { data: result } = await this.$http.get('rights/list')
        if (result.meta.status !== 200) {
          return this.$message.error('获取权限列表失败!')
        }
        this.rightsList = result.data
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
