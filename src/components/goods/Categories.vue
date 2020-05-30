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
          <el-button @click="openAddCategoryDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>

      <!--表格-->
      <tree-table
        class="treeTable"
        :data="categoryList"
        :columns="columns"
        :stripe="props.stripe"
        :border="props.border"
        :selection-type="props.selectionType"
        :expand-type="props.expandType"
        :show-index="props.showIndex"
        :index-text="props.indexText"
      >
        <!--是否有效-->
        <template slot="isValid" scope="scope">
          <i style="color: red" class="el-icon-error" v-if="scope.row.cat_deleted"></i>
          <i style="color: lightgreen" class="el-icon-success" v-else></i>
        </template>
        <!--排序-->
        <template slot="sort" scope="scope">
          <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>

        <!--操作-->
        <template slot="operation" scope="scope">
          <!--修改-->
          <el-button @click="openEditCategoryDialog(scope.row)" icon="el-icon-edit" type="primary" size="mini">编辑
          </el-button>
          <!--删除-->
          <el-button @click="deleteCategory(scope.row)" icon="el-icon-delete" type="danger" size="mini">删除</el-button>

        </template>
      </tree-table>

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

      <!--添加分类对话框-->
      <el-dialog
        title="添加分类"
        :visible.sync="addCategoryDialogVisible"
        width="50%"
        @close="resetAddCategoryForm"
      >
        <!--添加分类表单-->
        <el-form
          :model="addCategoryForm"
          :rules="addCategoryRules"
          ref="addCategoryFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCategoryForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="selectedCategoryIds"
              :options="parentCategoryList"
              :props="cascaderProps"
              @change="parentCategoryChange"
              clearable
            >

            </el-cascader>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="addCategory">确 定</el-button>
        </span>
      </el-dialog>

      <!--编辑分类对话框-->
      <el-dialog
        title="编辑分类"
        :visible.sync="editCategoryDialogVisible"
        width="30%"
        @close="closeEditCategoryDialog"
      >
        <el-form
          :model="editCategoryForm"
          :rules="editCategoryRules"
          ref="editCategoryFormRef"
          label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCategoryForm.cat_name"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editCategoryDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCategory">确 定</el-button>
        </span>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Categories',
    data () {
      const categoryName = [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
      ]

      return {
        // 查询条件
        queryCategoryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        totalCategory: 0,
        // 商品
        categoryList: [],
        props: {
          stripe: false,
          border: true,
          showHeader: true,
          showSummary: false,
          showRowHover: true,
          showIndex: true,
          indexText: '#',
          treeType: true,
          isFold: true,
          expandType: false,
          selectionType: false
        },
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使 用模板名称
            template: 'isValid'
          },
          {
            label: '排序',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使 用模板名称
            template: 'sort'
          },
          {
            label: '操作',
            // 表示，将当前列定义为模板列
            type: 'template',
            // 表示当前这一列使 用模板名称
            template: 'operation'
          }
        ],
        // 控制添加分类对话框的显示与隐藏
        addCategoryDialogVisible: false,
        addCategoryForm: {
          // 分类名称
          cat_name: '',
          // 分类父 ID
          cat_pid: 0,
          // 分类层级
          cat_level: 0
        },
        addCategoryRules: {
          cat_name: categoryName
        },
        // 父级分类
        parentCategoryList: [],
        // 选择的父级分类
        selectedCategoryIds: [],
        cascaderProps: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children',
          checkStrictly: true
        },
        editCategoryDialogVisible: false,
        // 编辑分类表单
        editCategoryForm: {
          cat_name: ''
        },
        editCategoryRules: {
          cat_name: categoryName
        }
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
      },
      openAddCategoryDialog () {
        this.getParentCategory()
        this.addCategoryDialogVisible = true
      },
      // 获取父级分类的数据列表
      async getParentCategory () {
        const { data: result } = await this.$http.get('categories', {
          params: {
            type: 2
          }
        })
        if (result.meta.status !== 200) {
          return this.$message.error('获取分类失败')
        }
        this.parentCategoryList = result.data
      },
      // 选择项发生变化
      parentCategoryChange (value) {
        // 如果selectedCategoryIds数组中的length 大于0，证明选中的父级分类
        // 反之，就说明没有选中任何父级分类
        if (this.selectedCategoryIds.length > 0) {
          // 父类id
          this.addCategoryForm.cat_pid = this.selectedCategoryIds[this.selectedCategoryIds.length - 1]
          // 当前分类等级
          this.addCategoryForm.cat_level = this.selectedCategoryIds.length
        } else {
          this.addCategoryForm.cat_pid = 0
          this.addCategoryForm.cat_level = 0
        }
      },
      // 添加分类
      addCategory () {
        // 校验
        this.$refs.addCategoryFormRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('请检查配置!')
          }
          const { data: result } = await this.$http.post('categories', this.addCategoryForm)
          if (result.meta.status !== 201) {
            return this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.queryCategories()
          this.addCategoryDialogVisible = false
        })
      },
      // 重置表单
      resetAddCategoryForm () {
        this.$refs.addCategoryFormRef.resetFields()
        this.selectedCategoryIds = []
        this.addCategoryForm.cat_pid = 0
        this.addCategoryForm.cat_level = 0
      },
      // 打开编辑对话框
      async openEditCategoryDialog (categoryInfo) {
        const { data: result } = await this.$http.get(`categories/${categoryInfo.cat_id}`)
        if (result.meta.status !== 200) {
          return this.$message.error('获取分类名称失败!')
        }
        this.editCategoryForm = result.data
        this.editCategoryDialogVisible = true
      },
      // 重置编辑对话框表单
      closeEditCategoryDialog () {
        this.$refs.editCategoryFormRef.resetFields()
      },
      // 提交修改后的分类
      editCategory () {
        this.$refs.editCategoryFormRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('请输入合法的分类名称')
          }
          const { data: result } = await this.$http.put(`categories/${this.editCategoryForm.cat_id}`, {
            cat_name: this.editCategoryForm.cat_name
          })
          if (result.meta.status !== 200) {
            return this.$message.error('修改分类名称失败')
          }
          this.queryCategories()
          this.editCategoryDialogVisible = false
        })
      },
      async deleteCategory (categoryInfo) {
        const action = await this.$confirm(`确定删除:${categoryInfo.cat_name}`, '删除分类', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => {
          return err
        })
        if (action !== 'confirm') {
          return this.$message.info('取消删除分类')
        }
        const { data: result } = await this.$http.delete(`categories/${categoryInfo.cat_id}`)
        if (result.meta.status !== 200) {
          return this.$message.error('删除分类失败')
        }
        this.queryCategories()
        this.$message.success('删除分类成功')
      }
    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 15px;
  }

  .el-cascader {
    width: 100%;
  }

</style>
