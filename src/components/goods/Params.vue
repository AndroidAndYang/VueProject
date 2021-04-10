<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  中间内容部分  -->
    <el-card>
      <el-alert class="bdcontent" show-icon title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false"></el-alert>
      <div class="content-left">
        <span style="margin-top: 10px"> 选择商品分类：</span>
        <!-- options 用来指定数据源 -->
        <!-- props 用来指定配置对象 -->
        <el-cascader class="content-left" :options="parentCateList"
                     :props="cascaderProps" v-model="selectedKeys" @change="cateSelectEvent()">
        </el-cascader>
      </div>
      <!--  tab切换  -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数内容  -->
        <el-tab-pane label="动态参数" name="many" class="content-left">
          <div style="width: 100%">
            <div class="content-left">
              <el-button type="primary" @click="addDialogVisible=true" size="small"
                         :disabled="this.selectedKeys.length!==3">添加参数
              </el-button>
            </div>
            <!--  表格部分  -->
            <el-table
                :data="manyTableData"
                style="width: 100%"
                border stripe>
              <!--  展开行  -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染Tag标签 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                    {{ item }}
                  </el-tag>
                  <!-- 输入的文本框 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                            ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                  </el-button>
                </template>
              </el-table-column>

              <el-table-column
                  type="index"
                  label="#"
                  width="50">
              </el-table-column>

              <el-table-column
                  label="参数名称"
                  prop="attr_name">
              </el-table-column>
              <el-table-column
                  label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editParams(scope.row.attr_id)">
                    编辑
                  </el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 静态属性内容  -->
        <el-tab-pane label="静态属性" name="only" class="content-left">
          <div style="width: 100%">
            <div class="content-left">
              <el-button type="primary" @click="addDialogVisible=true" size="small"
                         :disabled="this.selectedKeys.length !== 3">添加属性
              </el-button>
            </div>
            <el-table
                :data="onlyTableData"
                style="width: 100%"
                border stripe>
              <!--  展开行  -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染Tag标签 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">
                    {{ item }}
                  </el-tag>
                  <!-- 输入的文本框 -->
                  <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                            ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)">
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                  </el-button>
                </template>
              </el-table-column>

              <el-table-column
                  type="index"
                  label="#"
                  width="50">
              </el-table-column>

              <el-table-column
                  label="参数名称"
                  prop="attr_name">
              </el-table-column>
              <el-table-column
                  label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editParams(scope.row.attr_id)">
                    编辑
                  </el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--  添加分类/属性 对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAdd">确 定</el-button>
      </span>
    </el-dialog>

    <!--  修改分类/属性 对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 添加参数的对话框 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Params",
  data: function () {
    return {
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的分类数据
      selectedKeys: [],
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 添加对话框
      addDialogVisible: false,
      // 添加需要的参数
      addForm: {
        attr_name: ''
      },
      // 添加的校验规则
      addFormRules: {
        attr_name: [
          {required: true, message: "请输入内容", trigger: "blur"}
        ]
      },
      // 修改对话框
      editDialogVisible: false,
      // 修改需要的参数
      editForm: {},
      // 修改的校验规则
      editFormRules: {
        attr_name: [
          {required: true, message: "请输入内容", trigger: "blur"}
        ]
      },
    }
  },
  created() {
    this.getCategories();
  },
  methods: {
    // 获取所有分类
    async getCategories() {
      const res = await this.$retrofit.get('categories', {
        params: {type: 3}
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    // 分类选中
    async cateSelectEvent() {
      // 只能选择三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return
      }
      await this.getParams();
    },
    // 获取参数
    async getParams() {
      // 根据所选分类的Id，和当前所处的面板，获取对应的参数
      const res = await this.$retrofit.get(
          `categories/${this.selectedKeys[this.selectedKeys.length - 1]}/attributes`,
          {
            params: {sel: this.activeName}
          }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })
      // 判断选择的是参数还是属性，赋值相对应的值
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 显示添加的tag输入框
    showInput(item) {
      item.inputVisible = true
    },
    // 添加tag
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      this.saveAttrVals(row)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求，保存这次操作
      const res = await this.$retrofit.put(
          `categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(' ')
          }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },
    // tab 点击切换
    handleClick() {
      this.cateSelectEvent()
    },
    // 添加的对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 修改的对话框关闭
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 确认添加
    confirmAdd() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$retrofit.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        // 重新获取参数
        await this.getParams();
      })
    },
    // 确认修改
    confirmEdit() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const res = await this.$retrofit.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {attr_name: this.editForm.attr_name, attr_sel: this.activeName}
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        await this.getParams()
        this.editDialogVisible = false
      })
    },
    // 修改参数
    async editParams(attrId) {
      // 查询当前参数的信息
      const res = await this.$retrofit.get(
          `categories/${this.cateId}/attributes/${attrId}`,
          {
            params: {attr_sel: this.activeName}
          }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 根据Id删除对应的参数
    async removeParams(attrId) {
      const confirmResult = await this.$confirm(
          '此操作将永久删除该参数, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      // 用户取消了删除的操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      // 删除的业务逻辑
      const res = await this.$retrofit.delete(
          `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      // 重新获取参数
      await this.getParams();
    },
    // 删除Tag
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 获取当前选中的三级分类的Id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 根据选中的tab来获取name
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped>
.bdcontent {
  margin-bottom: 15px;
}

.el-tag {
  margin-right: 10px;
}

.el-input {
  width: auto !important;
}
</style>