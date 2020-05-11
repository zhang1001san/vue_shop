<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区-->
    <el-card>
      <!--搜索和添加用户区域-->
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="grid-content bg-purple">
            <el-input
              clearable
              @clear="getUserList()"
              @change="getUserList()"
              v-model="queryInfo.query"
              placeholder="请输入查询的用户"
            >
              <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-button @click="addUserDialogVisible = true" type="primary">添加用户</el-button>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple"></div>
        </el-col>
      </el-row>

      <!--用户列表区-->
      <el-table
        :data="userList"
        border
        stripe
        style="width: 100%">
        <el-table-column
          type="index"
          label="#">
        </el-table-column>
        <el-table-column
          prop="username"
          label="姓名">
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱">
        </el-table-column>
        <el-table-column
          prop="mobile"
          label="电话">
        </el-table-column>
        <el-table-column
          prop="role_name"
          label="角色">
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
              active-color="#13ce66"
              inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--修改-->
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
              <el-button @click="showEditDialag(scope.row.id)" icon="el-icon-edit" type="primary"
                         size="mini"></el-button>
            </el-tooltip>

            <!--删除-->
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button @click="deleteUser(scope.row)" icon="el-icon-delete" type="danger" size="mini"></el-button>
            </el-tooltip>
            <!--分配角色-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button icon="el-icon-setting" type="warning" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!--添加用户对话框-->
      <el-dialog
        title="添加用户"
        :visible.sync="addUserDialogVisible"
        width="50%"
        @close="addUserDialagClose"
      >
        <!--内容主体区-->
        <el-form ref="addUserRuleFormRef" :model="addUserForm" :rules="addUserFormRules" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input show-password v-model="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <!--底部区域-->
        <span slot="footer" class="dialog-footer">
           <el-button @click="addUserDialogVisible = false">取 消</el-button>
           <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!--编辑用户对话框-->
      <el-dialog
        title="编辑用户"
        :visible.sync="editUserDialagVisible"
        width="50%"
        @close="editUserDialagClose"
      >
        <!--内容主体区-->
        <el-form ref="editUserRuleFormRef" :model="editUserForm" :rules="editUserFormRules" label-width="70px">
          <el-form-item label="用户名">
            <el-input disabled v-model="editUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <!--底部区域-->
        <span slot="footer" class="dialog-footer">
           <el-button @click="editUserDialagVisible = false">取 消</el-button>
           <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>

    </el-card>

  </div>
</template>

<script>
  export default {
    name: 'Users',
    created () {
      this.getUserList()
    },
    data () {
      // 校验邮箱的规则
      const checkEmail = (rule, value, callback) => {
        // 验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          // 合法的邮箱
          return callback()
        }
        callback(new Error('请输入合法的邮箱'))
      }

      // 校验手机号的规则
      const checkPhone = (rule, value, callBack) => {
        // 验证手机号的正则表达式
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return callBack()
        }
        callBack(new Error('请输入合法的手机号'))
      }

      return {
        queryInfo: {
          query: '',
          // 当前页数
          pagenum: 1,
          // 每页显示的多少条数据
          pagesize: 5
        },
        // 用户列表
        userList: [],
        // 用户总数
        total: 0,
        // 控制添加用户对话框的显示与隐藏
        addUserDialogVisible: false,
        // 修改用户对话框的显示与隐藏
        editUserDialagVisible: false,
        // 添加的表单数据
        addUserForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 添加的表单数据
        editUserForm: {},
        // 添加用户表单的校验
        addUserFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '用户名长度在3~10字符之间', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 15, message: '密码长度在6~15字符之间', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkPhone, trigger: 'blur' }
          ]
        },
        editUserFormRules: {
          email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkPhone, trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      async getUserList () {
        const { data: result } = await this.$http.get('users', {
          params: this.queryInfo
        })
        if (result.meta.status !== 200) {
          return this.$message.error(result.meta.msg)
        }
        this.userList = result.data.users
        this.total = result.data.total
      },
      // 监听每页大小改变事件
      handleSizeChange (pagesize) {
        this.queryInfo.pagesize = pagesize
        this.getUserList()
      },
      // 监听当前页改变事件
      handleCurrentChange (pagenum) {
        this.queryInfo.pagenum = pagenum
        this.getUserList()
      },
      // 修改用户状态
      async userStateChange (userInfo) {
        const { data: result } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (result.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败!')
        }
        this.$message.success('更新用户状态成功!')
        this.getUserList()
      },
      // 添加用户对话框关闭处理
      addUserDialagClose () {
        this.$refs.addUserRuleFormRef.resetFields()
      },
      // 添加用户
      addUser () {
        this.$refs.addUserRuleFormRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('请检查输入的内容是否合法!')
          }
          const { data: result } = await this.$http.post('users', this.addUserForm)
          if (result.meta.status !== 201) {
            return this.$message.error('添加用户失败!')
          }

          // 添加成功
          await this.getUserList()
          this.$message.success('添加用户成功!')
          this.addUserDialogVisible = false
        })
      },
      // 显示编辑用户对话框
      async showEditDialag (id) {
        this.editUserDialagVisible = true
        const { data: result } = await this.$http.get(`users/${id}`)
        if (result.meta.status !== 200) {
          return this.$message.error('查询用户失败!请重试')
        }
        this.editUserForm = result.data
      },
      // 关闭编辑用户对话框
      editUserDialagClose () {
        this.$refs.editUserRuleFormRef.resetFields()
      },
      // 修改用户
      editUser () {
        this.$refs.editUserRuleFormRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('请检查输入的内容是否合法!')
          }
          const { data: result } = await this.$http.put(`users/${this.editUserForm.id}`, {
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile
          })
          if (result.meta.status !== 200) {
            return this.$message.error('修改用户信息失败!')
          }
          // 修改成功
          await this.getUserList()
          this.$message.success('修改用户信息成功!')
          this.editUserDialagVisible = false
        })
      },
      // 删除用户
      deleteUser (userInfo) {
        this.$confirm(`确定删除用户: ${userInfo.username} ?`, '删除用户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: result } = await this.$http.delete(`users/${userInfo.id}`)
          if (result.meta.status !== 200) {
            return this.$message.error(`删除用户: ${userInfo.username} 失败!`)
          }
          this.$message.success('删除成功')
          this.getUserList()
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
