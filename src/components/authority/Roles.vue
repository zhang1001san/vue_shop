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
          <el-button type="primary">添加角色</el-button>
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
            <el-button icon="el-icon-edit" type="primary" size="mini">编辑</el-button>
            <!--删除-->
            <el-button icon="el-icon-delete" type="danger" size="mini">删除</el-button>
            <!--分配权限-->
            <el-button @click="setRightDialagVisible(scope.row)" icon="el-icon-setting" type="warning" size="mini">
              分配权限
            </el-button>

          </template>
        </el-table-column>

      </el-table>

    </el-card>

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
        roleId: ''
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
