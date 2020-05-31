<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区域-->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input clearable @change="searchClick" @clear="clearSearch" placeholder="请输入内容" v-model="queryInfo.query">
            <el-button @click="searchClick" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="goAddGoodsPage" type="primary">添加商品</el-button>
        </el-col>
      </el-row>

      <!--商品列表-->
      <el-table
        :data="goodsList"
        stripe
        border
        style="width: 100%">
        <!--索引列-->
        <el-table-column
          type="index"
          label="#"
        >
        </el-table-column>
        <el-table-column
          prop="goods_name"
          label="商品名称">
        </el-table-column>
        <el-table-column
          width="95px"
          prop="goods_price"
          label="商品价格(元)">
        </el-table-column>
        <el-table-column
          width="70px"
          prop="goods_weight"
          label="商品重量">
        </el-table-column>

        <el-table-column
          width="140px"
          label="创建时间">
          <template slot-scope="scope">
            {{scope.row.add_time|dateFormat}}
          </template>
        </el-table-column>

        <el-table-column
          width="130px"
          label="操作">
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="编辑" placement="top">
              <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>

            <el-tooltip class="item" effect="dark" content="删除" placement="top">
              <el-button @click="deleteGoods(scope.row.goods_id)" size="mini" type="danger"
                         icon="el-icon-delete"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>

      <!--分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total" background>
      </el-pagination>

    </el-card>

  </div>
</template>

<script>
  export default {
    name: 'GoodsList',
    data () {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        // 商品总数
        total: 0,
        goodsList: []
      }
    },
    created () {
      this.queryGoods()
    },
    methods: {
      /**
       * 查询商品
       */
      async queryGoods () {
        const { data: result } = await this.$http.get('goods', {
          params: this.queryInfo
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }
        console.log(result.data)
        this.total = result.data.total
        this.goodsList = result.data.goods
      },
      /**
       * 改变每页大小
       * @param newPageSize 每页大小
       */
      handleSizeChange (newPageSize) {
        this.queryInfo.pagesize = newPageSize
        this.queryGoods()
      },
      /**
       * 改变页数
       * @param newPageNum 新页数
       */
      handleCurrentChange (newPageNum) {
        this.queryInfo.pagenum = newPageNum
        this.queryGoods()
      },
      searchClick () {
        this.queryGoods()
      },
      clearSearch () {
        this.queryGoods()
      },
      // 跳转到添加商品界面
      goAddGoodsPage () {
        this.$router.push('/goods/add')
      },
      async deleteGoods (goodsId) {
        const action = await this.$confirm('确定删除此商品?', '删除商品', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (action !== 'confirm') {
          return this.$message.info('已取消删除商品')
        }
        const { data: result } = await this.$http.delete(`goods/${goodsId}`)
        if (result.meta.status !== 200) {
          return this.$message.error('删除商品失败')
        }
        this.$message.success('删除商品成功')
        this.queryGoods()
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
