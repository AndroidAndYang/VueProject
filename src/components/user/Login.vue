<template>
  <div class='login-container'>
    <div class='login'>
      <div class='logo'>
        <img src='../../assets/logo.png'>
      </div>
      <div class='content'>
        <!--  :model 绑定vue中的值    -->
        <!--  ref定义引用，用户获取表单的对象，在methods中，可以使用validate，resetFields函数  -->
        <el-form :model='LoginFrom' ref='loginFromRef' :rules='loginFromRules'>
          <el-form-item prop='username'>
            <!--  prefix-icon 输入框前面的icon  -->
            <el-input prefix-icon='iconfont icon-user' v-model='LoginFrom.username' placeholder='请输入用户名'></el-input>
          </el-form-item>
          <el-form-item prop='password'>
            <el-input prefix-icon='iconfont icon-3702mima' type='password' v-model='LoginFrom.password'
                      placeholder='请输入密码'></el-input>
          </el-form-item>
          <el-form-item class='bottom-btn'>
            <el-button type='success' @click.prevent='login()'>登录</el-button>
            <el-button type='info' @click='reset()'>重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      outerVisible: false,
      LoginFrom: {
        username: 'admin',
        password: '123456'
      },
      loginFromRules: {
        username: [
          //  trigger blue 鼠标点击外部时，change 数值改变时
          { require: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { require: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 登录
    login() {
      // $refs 需要在form中定义ref，其中值就是我们获取通过$ref获取值的name
      // 同理 重置也是一样
      /**
       * @params valid 是否通过验证
       */
      // 箭头函数没有this指向，this默认指向文件的作用域
      this.$refs['loginFromRef'].validate(async valid => {
        console.log(this.LoginFrom)
        if (valid) {
          let res = await this.$retrofit.post('login', this.LoginFrom)
          console.log(res)
          if (res.meta.status != 200) {
            this.$toast.error('登录失败')
            return
          }
          this.$toast.success('登录成功')
          // session 为window对象，不能使用this
          window.sessionStorage.setItem('token', res.data.token)
          // 跳转到首页
          this.$router.push('/home').then(r => {
            console.log("login exception = ",r)
          })
        } else {
          this.$toast.error('验证失败')
        }
      })
    },
    // 重置
    reset() {
      this.$refs['loginFromRef'].resetFields()
    }
  }
}
</script>

<!-- scoped 防止style冲突，只在当前文件中生效 -->
<style scoped>

.login-container {
  height: 100%;
  background: #2b4b6b;
}

.login {
  position: absolute;
  top: 50%;
  left: 50%;
  background: white;
  width: 450px;
  height: 300px;
  transform: translate(-50%, -50%);
}

.login .logo {
  background: #e5e1e1;
  border: 10px solid white;
  box-shadow: 0 0 10px #d0d0d0;
  border-radius: 50%;
  position: absolute;
  left: 50%;
  overflow: hidden;
  transform: translate(-50%, -50%);
  padding: 5px;
  width: 80px;
  height: 80px;
}

.login .logo img {
  width: 100%;
  height: 100%;
}

.login .content {
  padding: 0 20px;
  margin-top: 100px;
}

.login .bottom-btn {
  display: flex;
  padding-right: 20px;
  justify-content: flex-end;
}

</style>
