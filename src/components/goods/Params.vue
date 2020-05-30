<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区域-->
    <el-card class="box-card">
      <!--警告区域-->
      <el-alert
        show-icon
        :closable="false"
        title="注意:只允许为第三级分类设置相关参数!"
        type="warning">
      </el-alert>

      <!--选择商品分类区域-->
      <el-row class="category">
        <el-col>
          <span>选择商品分类:</span>
          <!--选择商品分类的级联选择框-->
          <el-cascader
            v-model="selectedCategoryIds"
            :options="categoryList"
            :props="cascaderProps"
            @change="categoryChange"></el-cascader>
        </el-col>
      </el-row>

      <!--tab页签区域-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!--动态参数面板-->
        <el-tab-pane label="动态参数" name="many">
          <el-button @click="openTabDialog" :disabled="isBtnDisable" type="primary" size="mini">添加参数</el-button>

          <!--动态参数表格-->
          <el-table
            :data="manyTabData"
            border
            stripe
          >
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--循环渲染tag标签-->
                <el-tag
                  v-for="(attrVal,index) in scope.row.attr_vals"
                  :key="attrVal"
                  closable
                  @close="handleTagClose(scope.row,index)"
                >
                  {{attrVal}}
                </el-tag>

                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)">
                  + New Tag
                </el-button>

              </template>

            </el-table-column>
            <!--索引列-->
            <el-table-column type="index" label="#">
            </el-table-column>

            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>

            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="openEditDialog(scope.row.attr_id)"
                  size="mini" type="primary" icon="el-icon-edit">
                  编辑
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParam(scope.row)"
                >删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>
        <!--静态属性面板-->
        <el-tab-pane label="静态属性" name="only">
          <el-button @click="openTabDialog" :disabled="isBtnDisable" type="primary" size="mini">添加属性</el-button>

          <!--静态属性表格-->
          <el-table
            :data="onlyTabData"
            border
            stripe
          >
            <!--展开行-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!--循环渲染tag标签-->
                <el-tag
                  v-for="(attrVal,index) in scope.row.attr_vals"
                  :key="attrVal"
                  closable
                  @close="handleTagClose(scope.row,index)"
                >
                  {{attrVal}}
                </el-tag>

                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)">
                  + New Tag
                </el-button>

              </template>

            </el-table-column>
            <!--索引列-->
            <el-table-column type="index" label="#">
            </el-table-column>

            <el-table-column prop="attr_name" label="属性名称">
            </el-table-column>

            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  @click="openEditDialog(scope.row.attr_id)"
                  size="mini"
                  type="primary"
                  icon="el-icon-edit">
                  编辑
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteParam(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>

        <!--添加属性对话框-->
        <el-dialog
          :title="'添加'+titleText"
          :visible.sync="addDialogVisiable"
          width="50%"
          @close="addParamDialogClosed"
        >
          <!--添加参数表单-->
          <el-form :model="addParamForm" :rules="addParamRules" ref="addParamRef" label-width="100px">
            <el-form-item :label="paramLabelText" prop="attr_name">
              <el-input v-model="addParamForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisiable = false">取 消</el-button>
            <el-button type="primary" @click="addParam()">确 定</el-button>
          </span>
        </el-dialog>

        <!--修改属性对话框-->
        <el-dialog
          :title="'修改'+titleText"
          :visible.sync="editDialogVisiable"
          width="50%"
          @close="editParamDialogClosed"
        >
          <!--修改参数表单-->
          <el-form :model="editParamForm" :rules="addParamRules" ref="editParamRef" label-width="100px">
            <el-form-item :label="paramLabelText" prop="attr_name">
              <el-input v-model="editParamForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisiable = false">取 消</el-button>
            <el-button @click="editParam()" type="primary">确 定</el-button>
          </span>
        </el-dialog>

      </el-tabs>

    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Params',
    data () {
      return {
        // 所有商品分类数据
        categoryList: [],
        cascaderProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        // 选择商品分类的id
        selectedCategoryIds: [],
        // 默认选中的tab页
        activeName: 'many',
        // 动态参数数据
        manyTabData: [],
        // 静态属性数据
        onlyTabData: [],
        // 控制添加对话框的显示与隐藏
        addDialogVisiable: false,
        // 添加参数表单
        addParamForm: {
          attr_name: ''
        },
        // 添加参数表单校验规则
        addParamRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' },
            { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
          ]
        },
        // 控制编辑对话框的显示与隐藏
        editDialogVisiable: false,
        // 编辑参数表单
        editParamForm: {
          attr_name: ''
        }
      }
    },
    created () {
      this.getCategoryList()
    },
    methods: {
      async getCategoryList () {
        const { data: result } = await this.$http.get('categories')
        if (result.meta.status !== 200) {
          return this.$message.error('获取分类失败')
        }
        this.categoryList = result.data
      },
      categoryChange () {
        this.getParmasData()
      },
      async getParmasData () {
        // 清空
        this.onlyTabData = []
        this.manyTabData = []
        // 不是三级分类
        if (this.selectedCategoryIds.length !== 3) {
          this.selectedCategoryIds = []
          return
        }
        // 三级分类
        const { data: result } = await this.$http.get(`categories/${this.categoryId}/attributes`, {
          params: {
            sel: this.activeName
          }
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        }

        result.data.forEach(item => {
          // 转换为数组
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 控制文本框的显示与隐藏
          item.inputVisible = false
          // 文本框的内容
          item.inputValue = ''
          item.ref = 'saveTagInput'
        })
        console.log(result.data)
        if (this.activeName === 'many') {
          this.manyTabData = result.data
        } else if (this.activeName === 'only') {
          this.onlyTabData = result.data
        } else {
          console.log('other option')
        }
      },
      handleTabClick () {
        this.getParmasData()
      },
      openTabDialog () {
        this.addDialogVisiable = true
      },
      // 监听添加对话框的关闭事件
      addParamDialogClosed () {
        this.$refs.addParamRef.resetFields()
      },
      addParam () {
        this.$refs.addParamRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('参数不合法!')
          }
          const { data: result } = await this.$http.post(`categories/${this.categoryId}/attributes`, {
            attr_name: this.addParamForm.attr_name,
            attr_sel: this.activeName
          })
          if (result.meta.status !== 201) {
            return this.$message.error(this.titleText + '失败')
          }
          this.getParmasData()
          this.addDialogVisiable = false
          this.$message.success(this.titleText + '成功')
        })
      },
      // 打开编辑对话框
      async openEditDialog (attrId) {
        const { data: result } = await this.$http.get(`categories/${this.categoryId}/attributes/${attrId}`, {
          params: {
            attr_sel: this.activeName
          }
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }
        this.editParamForm = result.data
        this.editDialogVisiable = true
      },
      editParamDialogClosed () {
        this.$refs.editParamRef.resetFields()
      },
      // 提交修改后的参数名称
      editParam () {
        this.$refs.editParamRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('参数非法')
          }
          const { data: result } = await this.$http.put(`categories/${this.categoryId}/attributes/${this.editParamForm.attr_id}`, {
            attr_name: this.editParamForm.attr_name,
            attr_sel: this.activeName
          })
          if (result.meta.status !== 200) {
            return this.$message.error('修改参数失败!')
          }
          this.getParmasData()
          this.editDialogVisiable = false
          this.$message.success('修改参数成功')
        })
      },
      /**
       * 删除属性
       * @param row 删除的属性
       */
      async deleteParam (row) {
        const action = await this.$confirm(`确定删除:${row.attr_name}?`, `删除${this.paramLabelText}`, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (action !== 'confirm') {
          return this.$message.info(`取消删除${row.attr_name}`)
        }
        const { data: result } = await this.$http.delete(`categories/${this.categoryId}/attributes/${row.attr_id}`)
        if (result.meta.status !== 200) {
          return this.$message.error(`删除${row.attr_name}失败`)
        }
        this.getParmasData()
        this.$message.success(`删除${row.attr_name}成功`)
      },
      // 输入框失去焦点或者点击回车处理函数
      async handleInputConfirm (row) {
        const inputValue = row.inputValue.trim()
        // 内容不合法,返回
        if (inputValue.length === 0) {
          row.inputVisible = false
          row.inputValue = ''
          return
        }
        row.attr_vals.push(inputValue)
        row.inputVisible = false
        row.inputValue = ''
        this.saveAttr(row)
      },
      async saveAttr (row) {
        // 保存
        const { data: result } = await this.$http.put(`categories/${this.categoryId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: this.activeName,
          attr_vals: row.attr_vals.join(' ')
        })
        if (result.meta.status !== 200) {
          return this.$message.error('修改参数项失败')
        }
        this.$message.success('修改参数项成功!')
      },
      // 显示输入框
      showInput (row) {
        row.inputVisible = true
        // 让文本框自动获得焦点
        /**
         * $nextTick 方法的作用，就是当页面上元素
         * 被重新渲染之后，才会指定回调函数中的代码
         */
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      /**
       * 删除参数项
       * @param row 每一行的数据
       * @param index 参数项索引
       */
      handleTagClose (row, index) {
        row.attr_vals.splice(index, 1)
        this.saveAttr(row)
      }
    },
    computed: {
      // 按钮是否要禁用。返回true禁用，否则不禁用
      isBtnDisable () {
        if (this.selectedCategoryIds.length !== 3) {
          return true
        }
        return false
      },
      // 选中三级分类的id
      categoryId () {
        if (this.selectedCategoryIds.length !== 3) {
          return null
        }
        return this.selectedCategoryIds[2]
      },
      titleText () {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      },
      paramLabelText () {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    }
  }
</script>

<style lang="less" scoped>
  .category {
    margin-top: 15px;
  }

  .el-cascader {
    margin-left: 15px;
  }

  .el-tag {
    margin: 6px;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
  }
</style>
