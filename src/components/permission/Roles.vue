<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <div class="content-left">
        <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
      </div>
      <el-table
          :data="tableData"
          border
          style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form class="expand">
              <!-- 1行24等份，左边显示的内容区域 -->
              <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
                      v-for="(item1,i1) in scope.row.children" :key="item1.id">
                <!--  左侧内容  -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>

                <!--  右边显示的内容区域，右侧内容  -->
                <el-col :span="19">
                  <el-row :class="['vcenter',i2 === 0 ? '' : 'bdtop']" v-for="(item2,i2) in item1.children"
                          :key="item2.id" class="paddping-top">
                    <!--  中间内容  -->
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{
                          item2.authName
                        }}
                      </el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>

                    <!--  右侧内容  -->
                    <el-col :span="18">
                      <el-tag class="bdright" type="warning" v-for="item3 in item2.children"
                              :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                        {{ item3.authName }}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </el-form>
          </template>
        </el-table-column>

        <el-table-column
            prop="roleName"
            label="角色名称"/>

        <el-table-column
            prop="roleDesc"
            label="角色描述"/>

        <el-table-column
            label="操作">

          <template slot-scope="scope">
            <el-button icon="el-icon-edit" size="mini" type="primary" @click="editRoles(scope.row)">编辑</el-button>
            <el-button icon="el-icon-delete" size="mini" type="danger" @click="deleteRoles(scope.row)">删除</el-button>
            <el-button icon="el-icon-setting" size="mini" type="warning" @click="setRoles(scope.row)">分配权限</el-button>
          </template>

        </el-table-column>

      </el-table>
    </el-card>

    <el-dialog
        title="角色添加"
        :visible.sync="addRoleDialogVisible"
        width="50%" @close="closeAddDialog()">
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAddRole()">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
        title="角色编辑"
        :visible.sync="editRoleDialogVisible"
        width="50%">
      <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleRef" label-width="80px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEditRole">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
        title="分配权限"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="setRightDialogClosed">
      <!--
          data：tree 数据
          props: Tree显示的数据名
          default-checked-keys：默认选择的数据，需要指定 node-key
          default-expand-all：默认展开所有节点
          check-on-click-node：不点击checkbox就可以选中
      -->
      <el-tree
          :data="rightListData"
          :props="roleTree"
          :default-checked-keys="defKeys"
          node-key="id"
          show-checkbox
          default-expand-all
          check-on-click-node
          ref="treeRef">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data: function () {
    return {
      // 角色列表的所有数据
      tableData: [],
      // 添加角色对话框的控制
      addRoleDialogVisible: false,
      // 添加的校验规则
      addRoleRules: {
        roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}],
        roleDesc: [{required: true, message: '请输入角色描述', trigger: 'blur'}, {
          min: 3,
          max: 12,
          message: '长度在 3 到 12 个字符',
          trigger: 'blur'
        }]
      },
      // 添加角色绑定的数据
      addRoleForm: {
        roleName: "",
        roleDesc: ""
      },
      // 编辑角色对话框的控制
      editRoleDialogVisible: false,
      // 编辑角色的信息
      editRoleForm: {},
      // 编辑角色绑定的数据
      editRoleRules: {
        roleName: "",
        roleDesc: ""
      },
      // 分配用户权限对话框的控制
      setRoleDialogVisible: false,
      // 显示的属性
      roleTree: {
        label: "authName",
        children: "children"
      },
      // tree 数据
      rightListData: [],
      // 默认选中的节点Id值数组
      defKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const res = await this.$retrofit.get("roles")
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.tableData = res.data
    },
    // 添加角色
    confirmAddRole() {
      this.$refs.addRoleRef.validate(async validate => {
        if (!validate) {
          return this.$message.error("请输入正确的信息")
        }
        const res = await this.$retrofit.post("roles", {})
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.addRoleDialogVisible = false
        this.$message.success(res.meta.msg)
        await this.getRolesList()
      });
    },
    // 编辑角色
    async editRoles(role) {
      var res = await this.$retrofit.get('roles/' + role.id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisible = true
    },
    // 确认修改角色
    confirmEditRole() {
      console.log(this.editRoleForm)
      this.$refs.editRoleRef.validate(async validate => {
        if (!validate) {
          return this.$message.error("请输入正确的信息")
        }
        const res = await this.$retrofit.put("roles/" + this.editRoleForm.roleId, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.editRoleDialogVisible = false
        this.$message.success("修改成功！")
        await this.getRolesList()
      });
    },
    closeAddDialog() {
      this.$refs.addRoleRef.resetFields();
    },
    // 删除角色
    async deleteRoles(role) {
      const confirmResult = await this.$confirm(
          '此操作将永久删除该角色, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      // 删除请求
      var res = await this.$retrofit.delete('roles/' + role.id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      await this.getRolesList()
    },
    // 删除权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
          '此操作将永久删除, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      // 删除请求
      var res = await this.$retrofit.delete('roles/' + role.id + '/rights/' + rightId)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 返回的data, 是当前角色下最新的权限数据；所以重新赋值给当前的所有children对象
      role.children = res.data
    },
    // 分配角色
    async setRoles(role) {
      // 记录角色id，分配时需要角色id
      this.roleId = role.id
      // 获取所有权限的数据
      const res = await this.$retrofit.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      // 把获取到的权限数据保存到 data 中
      this.rightListData = res.data
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.defKeys)
      console.log(this.defKeys)
      this.setRoleDialogVisible = true
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      // 清空默认选择的节点
      this.defKeys = []
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const res = await this.$retrofit.post(
          `roles/${this.roleId}/rights`,
          {rids: idStr}
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      await this.getRolesList()
      this.setRoleDialogVisible = false
    }
  }
}
</script>

<style scoped>

.paddping-top {
  padding: 10px 0;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdright {
  margin: 5px;
}

/*内容剧中*/
.vcenter {
  display: flex;
  align-items: center;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>