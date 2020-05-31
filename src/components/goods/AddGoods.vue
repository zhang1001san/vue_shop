<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区域-->
    <el-card class="box-card">
      <el-alert
        :closable="false"
        show-icon
        center
        title="添加商品信息"
        type="info">
      </el-alert>

      <!--步骤条-->
      <!--
      activeIndex-0 转换为数字
      -->
      <el-steps :active="activeIndex-0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--表单-->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-position="top"
        label-width="100px">
        <!--Tab页签-->
        <el-tabs
          @tab-click="handleTabChange"
          :before-leave="handleBeforeLeave"
          v-model="activeIndex"
          tab-position="left">
          <el-tab-pane label="基本信息" name="0">

            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>

            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model.number="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model.number="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model.number="addGoodsForm.goods_number"></el-input>
            </el-form-item>

            <el-form-item label="商品分类" prop="goods_cat">
              <!--商品分类-->
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="categoryList"
                :props="categoryPros"
                @change="handleCategoryChange">
              </el-cascader>
            </el-form-item>

          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">

            <!--渲染表单item项-->
            <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border v-for="param in item.attr_vals" :key="param" :label="param"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>

          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <!--渲染表单item项-->
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>

          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">

            <!--上传图片-->
            <el-upload
              :action="uploadURL"
              :headers="uploadHeaders"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleUploadSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>

          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器-->
            <quill-editor
              v-model="addGoodsForm.goods_introduce"
            ></quill-editor>

            <!--添加商品-->
            <el-button @click="addGoods" class="btnAdd" type="primary">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>

      </el-form>

    </el-card>

    <el-dialog
      title="图片"
      :visible.sync="pictureDialogVisible"
      width="40%"
    >
      <el-image class="previeImageClass" :src="previewImageURL"></el-image>
    </el-dialog>

  </div>
</template>

<script>

  import _ from 'lodash'

  export default {
    name: 'AddGoods',
    data () {
      return {
        activeIndex: '0',
        // 添加商品表单对象
        addGoodsForm: {
          goods_name: '',
          // 价格
          goods_price: '',
          // 重量
          goods_weight: '',
          // 数量
          goods_number: '',
          // 商品分类
          goods_cat: [],
          // 上传成功的图片数组
          pics: [],
          // 商品描述
          goods_introduce: '',
          // 属性
          attrs: []
        },
        categoryPros: {
          expandTrigger: 'hover',
          label: 'cat_name',
          value: 'cat_id',
          children: 'children'
        },
        // 商品分类
        categoryList: [],
        // 添加商品表单校验规则
        addGoodsFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' },
            { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选中商品分类', trigger: 'blur' }
          ]
        },
        // 动态商品参数
        manyTabData: [],
        // 静态商品属性
        onlyTabData: [],
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        // 控制图片对话框的显示与隐藏
        pictureDialogVisible: false,
        // 预览图片的URL
        previewImageURL: ''
      }
    },
    created () {
      this.queryCategoryList()
    },
    methods: {
      /**
       * 查询商品分类
       */
      async queryCategoryList () {
        const { data: result } = await this.$http.get('categories')
        if (result.meta.status !== 200) {
          return this.$message.error('获取商品分类数据失败')
        }
        this.categoryList = result.data
      },
      handleCategoryChange () {
        if (this.addGoodsForm.goods_cat.length !== 3) {
          this.addGoodsForm.goods_cat = []
          return this.$message.error('请选择三级商品分类')
        }
      },
      /**
       * 切换tab页前的回调钩子
       * @param activeName 进入进入的标签页
       * @param oldActiveName 旧的标签页
       * @returns 返回false阻止进入新的标签页
       */
      handleBeforeLeave (activeName, oldActiveName) {
        // 基本信息tab页的商品分类选中三级分类才能切换tab页
        if (oldActiveName !== '0') {
          return true
        }
        if (this.addGoodsForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类')
          return false
        }
        return true
      },
      /**
       * Tab页改变
       */
      handleTabChange () {
        // 切换到商品参数tab页
        if (this.activeIndex === '1') {
          this.getManyParmasData()
        } else if (this.activeIndex === '2') {
          // 切换到商品属性tab页
          this.getOnlyParmasData()
        }
      },
      /**
       * 查询动态商品参数
       */
      async getManyParmasData () {
        const { data: result } = await this.$http.get(`categories/${this.categoryId}/attributes`, {
          params: {
            sel: 'many'
          }
        })

        if (result.meta.status !== 200) {
          return this.$message.error('获取商品分类失败')
        }
        result.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })

        this.manyTabData = result.data
      },
      /**
       * 查询静态商品属性
       */
      async getOnlyParmasData () {
        const { data: result } = await this.$http.get(`categories/${this.categoryId}/attributes`, {
          params: {
            sel: 'only'
          }
        })

        if (result.meta.status !== 200) {
          return this.$message.error('获取商品分类失败')
        }

        this.onlyTabData = result.data
        console.log(this.onlyTabData)
      },
      // 处理移除图片的操作
      handleRemove (file, fileList) {
        console.log(file)
        // 要移除的图片
        const removePic = file.response.data.tmp_path
        this.addGoodsForm.pics = this.addGoodsForm.pics.filter(item => removePic !== item)
        console.log(this.addGoodsForm)
      },
      // 处理图片预览效果
      handlePreview (file) {
        console.log(file)
        this.previewImageURL = file.response.data.url
        this.pictureDialogVisible = true
      },
      // 图片上传成功的钩子函数
      handleUploadSuccess (response) {
        console.log(response)
        if (response.meta.status !== 200) {
          return this.$message.error('上传图片失败')
        }
        // 上传成功的图片地址
        this.addGoodsForm.pics.push(response.data.tmp_path)
        console.log(this.addGoodsForm)
      },
      addGoods () {
        this.$refs.addGoodsFormRef.validate(async (valid) => {
          if (!valid) {
            return this.$message.error('请添加必要的表单项')
          }

          // 保存
          // 处理动态参数
          this.manyTabData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              // 选中的动态参数
              attr_value: item.attr_vals.join(' ')
            }
            this.addGoodsForm.attrs.push(newInfo)
          })

          // 处理静态属性
          this.onlyTabData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              // 静态属性
              attr_value: item.attr_vals
            }
            this.addGoodsForm.attrs.push(newInfo)
          })
          // (深拷贝)
          const cloneAddGoodsForm = _.cloneDeep(this.addGoodsForm)
          cloneAddGoodsForm.goods_cat = cloneAddGoodsForm.goods_cat.join(',')
          console.log(cloneAddGoodsForm)

          // 发起请求添加商品
          // 商品的名称，必须是唯一的
          const { data: result } = await this.$http.post('goods', cloneAddGoodsForm)
          if (result.meta.status !== 201) {
            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功!')
          this.$router.push('/goods')
        })
      }
    },
    computed: {
      /**
       * 选中的商品分类id
       */
      categoryId () {
        if (this.addGoodsForm.goods_cat.length !== 3) {
          return null
        }
        return this.addGoodsForm.goods_cat[2]
      },
      uploadHeaders () {
        // 图片上传组件的请求头
        const uploadHeader = {
          Authorization: window.sessionStorage.getItem('token')
        }
        return uploadHeader
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .previeImageClass {
    width: 100%;
  }

  .btnAdd {
    margin-top: 20px;
  }

</style>
