<template>

  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" @clear="getUserList()"
                    clearable>
            <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <el-table
          :data="userListData" border style="width: 100%">
        <el-table-column
            type="index"
            label="#"
            width="50">
        </el-table-column>

        <el-table-column
            prop="username"
            label="姓名"/>

        <el-table-column
            prop="email"
            label="邮箱"/>

        <el-table-column
            prop="mobile"
            label="电话"/>

        <el-table-column
            prop="role_name"
            label="角色"
            width="180"/>

        <el-table-column
            label="状态"
            width="180">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column
            width="210"
            prop="date"
            label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 10]"
          :page-size="100"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </el-card>

    <el-dialog
        title="用户添加"
        :visible.sync="addUserDialogVisible"
        width="50%" @close="closeAddDialog()">
      <el-form :model="addUserForm" :rules="addUserRules" ref="addUserRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddUser">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
        title="用户编辑"
        :visible.sync="editUserDialogVisible"
        width="50%">
      <el-form :model="editUserForm" :rules="editUserRules" ref="editUserRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="40%" @close="setRoleDialogClosed">
      <div class="role-content">
        <p>当前的用户：{{ userInfo.username }}</p>
      </div>
      <div class="role-content">
        <p>当前的角色：{{ userInfo.role_name }}</p>
      </div>
      <div class="role-content">
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "List",
  // 获取用户列表
  created() {
    this.getUserList();
  },

  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 列表数据
      userListData: [],
      // 请求用户接口的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 数据总数
      total: 0,
      // 添加弹窗
      addUserDialogVisible: false,
      // 修改弹窗
      editUserDialogVisible: false,
      // 分配角色
      setRoleDialogVisible: false,
      // 添加用户的数据
      addUserForm: {
        username: "",
        password: "",
        mobile: "",
        email: ""
      },
      // 添加用户的校验规则
      addUserRules: {
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入用户名', trigger: 'blur'},
          {min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur'}
        ],
        email: [
          {required: true, message: '请输入邮箱', trigger: 'blur'},
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '请输入手机号码', trigger: 'blur'},
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 修改的用户信息
      editUserForm: {},
      // 修改用户的校验规则
      editUserRules: {
        email: [
          {validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
          {validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 用户数据
      userInfo: {},
      // 选择的角色Id
      selectedRoleId: '',
      // 角色数据
      rolesList: []
    }
  },
  methods: {
    // pageSize 改变时会触发
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    // currentPage 改变时会触发
    handleCurrentChange(val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    // 获取用户列表
    async getUserList() {
      const res = await this.$retrofit.get("/users", {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error("获取用户列表失败")
        return
      }
      this.total = res.data.total;
      this.userListData = res.data.users
    },
    // 搜索
    search() {
      this.getUserList()
    },
    // 添加用户
    confirmAddUser: function () {
      this.$refs.addUserRef.validate(async validate => {
        if (!validate) {
          return this.$message.error("请输入正确的信息")
        }
        const res = await this.$retrofit.post("/users", this.addUserForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success("添加成功")
        // 隐藏添加对话框
        this.addUserDialogVisible = false
        await this.getUserList()
      })
    },
    // 添加弹窗关闭
    closeAddDialog() {
      // 清空存在的内容
      this.$refs.addUserRef.resetFields();
    },
    // 修改用户
    confirmEditUser() {
      this.$refs.editUserRef.validate(async validate => {
        if (!validate) {
          return this.$message.error("请输入正确的信息")
        }
        const res = await this.$retrofit.put("users/" + this.editUserForm.id, {
          email: this.editUserForm.email,
          mobile: this.editUserForm.mobile,
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success("修改成功")
        // 隐藏添加对话框
        this.editUserDialogVisible = false
        await this.getUserList()
      })
    },
    // 显示用户修改的弹窗
    async showEditDialog(uid) {
      // 根据uid获取用户信息
      const res = await this.$retrofit.get('/users/' + uid)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      this.editUserForm = res.data
      this.editUserDialogVisible = true
    },
    // 删除用户
    deleteUser(itemInfo) {
      console.log(itemInfo)
      let that = this;
      this.showDialog("删除用户", "此操作将永久删除该用户, 是否继续?", async function () {
        const res = await that.$retrofit.delete("/users/" + itemInfo.id)
        if (res.meta.status !== 200) {
          return that.$message.error(res.meta.msg)
        }
        that.$message.success(res.meta.msg)

        // 计算当前的page，因为删除不是第一页的最后一个数据的时候，列表会为空
        let totalPage = Math.ceil((that.total - 1) / that.queryInfo.pagesize)
        let currentPage = that.queryInfo.pagenum > totalPage ? totalPage : that.queryInfo.pagenum;
        that.queryInfo.pagenum = currentPage < 1 ? 1 : currentPage;

        await that.getUserList()
      })
    },
    // 分配角色
    async setRole(userInfo) {
      this.userInfo = userInfo
      console.log(userInfo)
      // 在展示对话框之前，获取所有角色的列表
      const res = await this.$retrofit.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 保存角色信息
    async saveRoleInfo() {
      if (this.selectedRoleId.length === 0) {
        return this.$message.error("请选择角色")
      }
      const res = await this.$retrofit.put(
          `users/${this.userInfo.id}/role`,
          {
            rid: this.selectedRoleId
          }
      )
      if (res.meta.status != 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      await this.getUserList()
    },
    // switch开关改变
    async userStateChanged(userinfo) {
      // 更新用户状态
      const res = await this.$retrofit.put(
          `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
    }
    ,
    // 分配角色dialog关闭
    setRoleDialogClosed() {
      this.selectedRoleId = ''
    }
  }
}
</script>

<style scoped>

.role-content {
  display: flex;
  justify-items: left;
}

</style>