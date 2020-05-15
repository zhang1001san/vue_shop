<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区-->
    <el-card class="box-card">
      <!--添加角色-->
      <el-row>
        <el-col>
          <el-button @click="setRoleDialogVisible()" type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!--角色列表-->
      <el-table
        :data="roleList"
        stripe
        border
        style="width: 100%">
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="{verticalCenter:true,borderBottom:true,borderTop:firstIndex===0}" :key="firstRoleItem.id"
                    v-for="(firstRoleItem,firstIndex) in scope.row.children">
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag @close="removeRightById(scope.row,firstRoleItem)" closable>{{firstRoleItem.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--渲染二级和三级权限-->
              <el-col :span="19">
                <el-row :class="{verticalCenter:true,borderTop:secordIndex!==0}" :key="secordRoleItem.id"
                        v-for="(secordRoleItem,secordIndex) in firstRoleItem.children">

                  <!--二级权限-->
                  <el-col :span="6">
                    <el-tag @close="removeRightById(scope.row,secordRoleItem)" type="success" closable>
                      {{secordRoleItem.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <!--三级权限-->
                  <el-col :span="18">
                    <el-tag type="warning" @close="removeRightById(scope.row,thirdRoleItem)"
                            :key="thirdRoleItem.id"
                            v-for="thirdRoleItem in secordRoleItem.children" closable>{{thirdRoleItem.authName}}
                    </el-tag>
                  </el-col>

                </el-row>
              </el-col>
            </el-row>

          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!--修改-->
            <el-button @click="setEditRoleDialogVisible(scope.row)" icon="el-icon-edit" type="primary" size="mini">编辑</el-button>
            <!--删除-->
            <el-button @click="deleteRole(scope.row)" icon="el-icon-delete" type="danger" size="mini">删除</el-button>
            <!--分配权限-->
            <el-button @click="setRightDialagVisible(scope.row)" icon="el-icon-setting" type="warning" size="mini">
              分配权限
            </el-button>

          </template>
        </el-table-column>

      </el-table>

    </el-card>

    <el-dialog
      title="添加角色"
      :visible.sync="roleDialogVisible"
      @close="closeRoleDialog()"
      width="40%">

      <!--表单主题区-->
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="roleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
       <el-button @click="roleDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="addRole()">确 定</el-button>
      </span>
    </el-dialog>

  <!-- 编辑角色区-->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisible"
      @close="closeEditRoleDialog()"
      width="40%">

      <!--表单主题区-->
      <el-form :model="editFoleForm" :rules="editRoleRules" ref="editRoleFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editFoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editFoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
       <el-button @click="editRoleDialogVisible = false">取 消</el-button>
       <el-button type="primary" @click="editRole()">确 定</el-button>
      </span>
    </el-dialog>

    <!--分配权限对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="rightDialogVisible"
      width="50%"
    >

      <el-tree
        :data="rightList"
        :props="rightTreeProps"
        show-checkbox
        default-expand-all
        :default-checked-keys="selectedRightKeyArr"
        node-key="id"
        ref="rightTreeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRight()">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data () {
      // 角色名称校验规则
      const validateRoleName = (rule, value, callback) => {
        if (value === '') {
          return callback(new Error('请输入角色名称'))
        }
        // 是否存在相同的角色名称了
        const isExistRoleName = this.roleList.some(role => {
          return role.roleName === this.roleForm.roleName
        })

        if (isExistRoleName) {
          return callback(new Error('角色名称不能重复!'))
        }
        // 校验通过
        callback()
      }

      return {
        // 角色列表
        roleList: [],
        // 分配权限对话框的显示与隐藏标志
        rightDialogVisible: false,
        // 树形权限列表
        rightList: [],
        // 树形控件的树形绑定对象
        rightTreeProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的权限
        selectedRightKeyArr: [],
        // 当前选中的角色id
        roleId: '',
        // 添加角色对话框的显示与隐藏标志
        roleDialogVisible: false,
        // 角色表单
        roleForm: {
          roleName: '',
          roleDesc: ''
        },
        // 角色正则校验
        roleRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
            { validator: validateRoleName, trigger: 'blur' }
          ]
        },
        // 编辑角色对话框
        editRoleDialogVisible: false,
        // 角色表单
        editFoleForm: {
          id: '',
          roleName: '',
          roleDesc: ''
        },
        // 角色正则校验
        editRoleRules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    created () {
      this.getRoleList()
    },
    methods: {
      // 获取角色列表
      async getRoleList () {
        const { data: result } = await this.$http.get('roles')
        if (result.meta.status !== 200) {
          return this.$message.error('获取角色列表失败!')
        }
        this.roleList = result.data
        console.log(result.data)
      },
      /**
       * 删除权限
       * @param roleInfo 角色信息
       * @param rightInfo 权限信息
       * @returns 删除结果
       */
      async removeRightById (roleInfo, rightInfo) {
        const confirmResult = await this.$confirm(`是否删除用户:${roleInfo.roleName} 的 ${rightInfo.authName} 权限?`, '删除权限', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除权限')
        }
        // 删除权限
        const { data: result } = await this.$http.delete(`roles/${roleInfo.id}/rights/${rightInfo.id}`)
        if (result.meta.status !== 200) {
          return this.$message.error('删除权限失败!')
        }
        // 为该用户重新复制权限即可，不用全部重启请求全部权限
        roleInfo.children = result.data
        // this.getRoleList()
        this.$message.success('删除权限成功')
      },
      // 显示分配权限对话框
      async setRightDialagVisible (roleInfo) {
        this.roleId = roleInfo.id
        // 获取树形的权限数据
        const { data: result } = await this.$http.get('rights/tree')
        if (result.meta.status !== 200) {
          return this.$message.error('获取权限列表失败！')
        }
        this.rightList = result.data
        console.log(result.data)
        this.selectedRightKeyArr = []
        this.getSelectedRightKeyRecursively(roleInfo, this.selectedRightKeyArr)
        this.rightDialogVisible = true
        console.log(this.selectedRightKeyArr)
      },
      /**
       * 通过递归的形式，获取角色下所有三级权
       *限的id,并保存到selectedRightKeyArr数组中
       * 递归获取拥有的权限
       * @param node 层级
       * @param arr 拥有的权限存放的容器
       */
      getSelectedRightKeyRecursively (node, arr) {
        // 如果当前node节点不包含children属性，则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        node.children.forEach(item => this.getSelectedRightKeyRecursively(item, arr))
      },
      // 分配权限
      async allocateRight () {
        const saveRightIdArr = [
          ...this.$refs.rightTreeRef.getCheckedKeys(),
          ...this.$refs.rightTreeRef.getHalfCheckedKeys()
        ]

        const rids = saveRightIdArr.join(',')
        const { data: result } = await this.$http.post(`roles/${this.roleId}/rights`, {
          rids
        })
        console.log(result)
        if (result.meta.status !== 200) {
          return this.$message.error('分配权限失败!')
        }
        this.$message.success('分配权限成功!')
        this.getRoleList()
        this.rightDialogVisible = false
      },
      // 打开添加角色对话框
      setRoleDialogVisible () {
        this.roleDialogVisible = true
      },
      // 添加角色
      addRole () {
        this.$refs.roleFormRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('请检查输入的内容是否正确!')
          }
          const { data: result } = await this.$http.post('roles', this.roleForm)
          if (result.meta.status !== 201) {
            return this.$message.error('保存角色失败!')
          }

          await this.getRoleList()
          this.$message.success('添加角色成功')
          this.roleDialogVisible = false
        })
      },
      // 关闭添加角色对话框
      closeRoleDialog () {
        this.$refs.roleFormRef.resetFields()
      },
      // 显示编辑对话框
      setEditRoleDialogVisible (roleInfo) {
        this.editFoleForm.id = roleInfo.id
        this.editFoleForm.roleName = roleInfo.roleName
        this.editFoleForm.roleDesc = roleInfo.roleDesc
        this.editRoleDialogVisible = true
      },
      editRole () {
        this.$refs.editRoleFormRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('请检查输入内容是否合法!')
          }
          const { data: result } = await this.$http.put(`roles/${this.editFoleForm.id}`, {
            roleName: this.editFoleForm.roleName,
            roleDesc: this.editFoleForm.roleDesc
          })
          if (result.meta.status !== 200) {
            return this.$message.error('更新角色信息失败!')
          }
          await this.getRoleList()
          this.$message.success('更新角色信息成功')
          this.editRoleDialogVisible = false
        })
      },
      // 重置编辑角色对话框
      closeEditRoleDialog () {
        this.$refs.editRoleFormRef.resetFields()
      },
      async deleteRole (roleInfo) {
        const message = await this.$confirm(`确定删除角色: ${roleInfo.roleName} ?`, '删除角色', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (message !== 'confirm') {
          return this.$message.info('已取消操作')
        }
        const { data: result } = await this.$http.delete(`roles/${roleInfo.id}`)
        if (result.meta.status !== 200) {
          return this.$message.error('删除角色失败')
        }
        await this.getRoleList()
        this.$message.success('删除角色成功')
      }
    }
  }
</script>

<style lang="less" scoped>

  .el-tag {
    margin: 7px;
  }

  .borderTop {
    border-top: 1px solid #eeeeee;
  }

  .borderBottom {
    border-bottom: 1px solid #eeeeee;
  }

  .verticalCenter {
    display: flex;
    align-items: center;
  }

</style>
