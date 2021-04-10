<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"/>
      <div style="margin-left: 50%;transform: translateX(-50%);margin-top: 30px">
        <!-- 步骤条区域 -->
        <el-steps :space="200" :active="activeIndex - 0 " finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
      </div>

      <el-form :model="goodsRuleForm" :rules="goodsRules" ref="addGoodsFormRef" style="margin-left: 20px">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClick()">
          <!--   基本信息     -->
          <el-tab-pane label="基本信息">
            <!--  Form信息   -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="goodsRuleForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="goodsRuleForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="goodsRuleForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="goodsRuleForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-col class="content-left">
                <!-- props 用来指定配置对象 -->
                <el-cascader class="content-left" :options="cateList"
                             :props="cascaderProps" v-model="goodsRuleForm.goods_cat">
                </el-cascader>
              </el-col>
            </el-form-item>
          </el-tab-pane>
          <!--   商品参数     -->
          <el-tab-pane label="商品参数">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!--   商品属性     -->
          <el-tab-pane label="商品属性">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!--   商品图片     -->
          <el-tab-pane label="商品图片">
            <el-upload
                :action="uploadURL"
                :headers="headerObj"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                :file-list="goodsRuleForm.pics"
                list-type="picture">
              <div class="content-left">
                <el-button size="small" type="primary">点击上传</el-button>
              </div>
            </el-upload>
          </el-tab-pane>
          <!--   商品内容   -->
          <el-tab-pane label="商品内容">
            <quill-editor v-model="goodsRuleForm.goods_introduce" style="height: 300px"></quill-editor>
            <div class="content-left">
              <!-- 添加商品的按钮 -->
              <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: "Add",
  data: function () {
    return {
      // 选中的索引
      activeIndex: '0',
      // 商品数据
      goodsRuleForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组，用于存储用户选择的图片
        pics: [],
        // 商品介绍
        goods_introduce: '',
        attrs:[]
      },
      // 商品约束
      goodsRules: {
        goods_name: [
          {required: true, message: '请输入商品名称', trigger: 'blur'}
        ],
        goods_price: [
          {required: true, message: '请输入商品价格', trigger: 'blur'}
        ],
        goods_weight: [
          {required: true, message: '请输入商品重量', trigger: 'blur'}
        ],
        goods_number: [
          {required: true, message: '请输入商品数量', trigger: 'blur'}
        ],
        goods_cat: [
          {required: true, message: '请选择商品分类', trigger: 'blur'}
        ]
      },
      // 分类数据
      cateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态属性列表数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象
      headerObj: {
        // 防止跨域
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览地址
      previewPath: '',
      // 图片预览显示控制
      previewVisible: false,
    }
  },
  methods: {
    // 类似onStart，点击tab会先触发该方法
    beforeTabLeave(activeName, oldActiveName) {
      console.log('即将离开的标签页名字是：' + oldActiveName)
      console.log('即将进入的标签页名字是：' + activeName)
      // return false
      if (oldActiveName === '0' && this.goodsRuleForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 左侧tab点击监听，用户加载数据
    async tabClick() {
      if (this.activeIndex === '1') {
        const res = await this.$retrofit.get(
            `categories/${this.cateId}/attributes`,
            {
              params: {sel: 'many'}
            }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const res = await this.$retrofit.get(
            `categories/${this.cateId}/attributes`,
            {
              params: {sel: 'only'}
            }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败！')
        }
        console.log(res.data)
        this.onlyTableData = res.data
      }
    },
    // 获取所有分类
    async getCategories() {
      const res = await this.$retrofit.get('categories', {
        params: {type: 3}
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.cateList = res.data
    },
    // 文件列表移除文件
    handleRemove(file) {
      console.log("remove", file);
    },
    // 点击文件列表中已上传的文件
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      // 1. 拼接得到一个图片信息对象
      const picInfo = response.data.url
      // 2. 将图片信息对象，push 到pics数组中
      this.goodsRuleForm.pics.push(picInfo)
      console.log(this.goodsRuleForm)
    },
    // 添加商品
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.goodsRuleForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.goodsRuleForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {attr_id: item.attr_id, attr_value: item.attr_vals}
          this.goodsRuleForm.attrs.push(newInfo)
        })
        form.attrs = this.goodsRuleForm.attrs
        console.log(form)
        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const res = await this.$retrofit.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        await this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getCategories();
  },
  computed: {
    cateId() {
      if (this.goodsRuleForm.goods_cat.length === 3) {
        return this.goodsRuleForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style scoped>
.previewImg {
  width: 100%;
}

.el-upload {
  display: block !important;
}

.btnAdd {
  margin-top: 55px;
}

</style>