<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card class="box-card">
      <el-row>
        <el-col>
          <el-button type="primary">添加分类</el-button>
        </el-col>
      </el-row>

      <!--表格-->
      <el-table
        :data="categoryList"
        stripe
        style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column prop="cat_name" label="是否有效">
          <template slot-scope="scope">
            <el-radio v-model="scope.row.cat_deleted" :label="false">是否删除</el-radio>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </el-table-column>

      </el-table>

      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryCategoryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50,100]"
        :page-size="queryCategoryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCategory">
      </el-pagination>

    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Categories',
    data () {
      return {
        queryCategoryInfo: {
          type: 1,
          pagenum: 1,
          pagesize: 5
        },
        totalCategory: 0,
        // 商品
        categoryList: []
      }
    },
    created () {
      this.queryCategories()
    },
    methods: {
      async queryCategories () {
        const { data: result } = await this.$http.get('categories', {
          params: this.queryCategoryInfo
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取商品分类失败!')
        }
        console.log(result)
        this.totalCategory = result.data.total
        this.categoryList = result.data.result
      },
      handleSizeChange (size) {
        this.queryCategoryInfo.pagesize = size
        this.queryCategories()
      },
      handleCurrentChange (pagenum) {
        this.queryCategoryInfo.pagenum = pagenum
        this.queryCategories()
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
