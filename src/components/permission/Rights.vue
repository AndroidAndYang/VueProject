<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-table
          :data="tableData"
          height="760px"
          border
          style="width: 100%">

        <el-table-column
            prop="authName"
            label="权限名称"/>

        <el-table-column
            prop="path"
            label="路径"/>

        <el-table-column
            prop="level"
            label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>

        </el-table-column>

      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  data: function () {
    return {
      tableData: []
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const res = await this.$retrofit.get("rights/list")
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.tableData = res.data
    }
  }
}
</script>

<style scoped>

</style>