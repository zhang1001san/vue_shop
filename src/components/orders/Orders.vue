<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区域-->
    <el-card class="box-card">
      <!-- 搜索-->
      <el-row>
        <el-col :span="8">
          <el-input @change="queryOrders()" @clear="queryOrders()" clearable placeholder="请输入内容"
                    v-model="queryInfo.query">
            <el-button @click="queryOrders()" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!--表格-->
      <el-table
        :data="orderList"
        border
        stripe
        style="width: 100%">
        <el-table-column
          type="index"
          label="#">
        </el-table-column>

        <el-table-column
          prop="order_number"
          label="订单编号">
        </el-table-column>

        <el-table-column
          prop="order_price"
          label="订单价格">
        </el-table-column>

        <el-table-column
          label="是否付款">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status===0" type="danger">未付款</el-tag>
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="is_send"
          label="是否发货">
        </el-table-column>

        <el-table-column
          label="下单时间">
          <template slot-scope="scope">
            {{scope.row.create_time|dateFormat}}
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
        >
          <template>
            <el-tooltip class="item" effect="dark" content="编辑" placement="top">
              <el-button @click="openAddressDialog" size="mini" type="primary" icon="el-icon-edit"></el-button>
            </el-tooltip>

            <el-tooltip class="item" effect="dark" content="地址" placement="top">
              <el-button @click="openLogisticsProgressDialog" size="mini" type="success"
                         icon="el-icon-location"></el-button>
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
        :total="total">
      </el-pagination>

    </el-card>

    <!--修改地址对话框-->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="address">
          <el-cascader
            v-model="addressForm.address"
            :options="citydata"
            :props="addressProps"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input v-model="addressForm.detailAddress"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!--物流进度对话框-->
    <el-dialog
      title="物流进度"
      :visible.sync="logisticsProgressDialogVisible"
      width="50%"
    >
      <span>这是一段信息</span>
    </el-dialog>

  </div>
</template>

<script>
  import citydata from './citydata'

  export default {
    name: 'Orders',
    data () {
      return {
        queryInfo: {
          query: '',
          pagenum: 1,
          pagesize: 10
        },
        // 总数量
        total: 0,
        // 订单
        orderList: [],
        // 控制修改地址对话框的显示与隐藏
        addressDialogVisible: false,
        // 地址表单
        addressForm: {
          // 省市区/县地址
          address: [],
          // 详细地址
          detailAddress: ''
        },
        addressFormRules: {
          address: [
            { required: true, message: '请输入省市区/县', trigger: 'blur' }
          ],
          detailAddress: [
            { required: true, message: '请输入详细地址', trigger: 'blur' }
          ]
        },
        addressProps: {
          expandTrigger: 'hover'
        },
        // 城市
        citydata,
        // 物流进度对话框
        logisticsProgressDialogVisible: false,
        // 物流进度
        logisticsProgress: []
      }
    },
    created () {
      this.queryOrders()
    },
    methods: {
      /**
       * 查询订单
       */
      async queryOrders () {
        const { data: result } = await this.$http.get('orders', {
          params: this.queryInfo
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取订单数据失败')
        }
        this.total = result.data.total
        this.orderList = result.data.goods
      },
      /**
       * 每页大小改变
       * @param newPageSize 新页数
       */
      handleSizeChange (newPageSize) {
        this.queryInfo.pagesize = newPageSize
        this.queryOrders()
      },
      /**
       * 页码改变
       * @param newPageNum 新页码
       */
      handleCurrentChange (newPageNum) {
        this.queryInfo.pagenum = newPageNum
        this.queryOrders()
      },
      openAddressDialog () {
        this.addressDialogVisible = true
      },
      /**
       * 关闭修改地址对话框
       */
      addressDialogClosed () {
        this.$refs.addressFormRef.resetFields()
      },
      async openLogisticsProgressDialog () {
        const { data: result } = await this.$http.get('/kuaidi/1106975712662')
        if (result.meta.status !== 200) {
          return this.$message.error('获取物流信息失败!')
        }
        this.logisticsProgress = result.data
        console.log(this.logisticsProgress)
        this.logisticsProgressDialogVisible = true
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }
</style>
