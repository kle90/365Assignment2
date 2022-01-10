<template>
  <el-menu :router="true" :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
    <el-menu-item index="1" :route="{name: `home`}">Home</el-menu-item>
    <el-menu-item index="2" :route="{name: `events`}">Events</el-menu-item>
    <el-menu-item index="3" :route="{name: `register`}">Register</el-menu-item>
    <el-menu-item index="4" :route="{name: `login`}">Login</el-menu-item>
  </el-menu>
  <el-input
      id="emailOfUser"
      placeholder="Please input your email"
      v-model="loginEmail"
      clearable>
  </el-input>
  <el-input
      type="password"
      id="inputPwUser"
      placeholder="Please input password"
      v-model="loginPassword"
      clearable>
  </el-input>
  <el-button v-on:click="loginUser()" type="primary" round>Login</el-button>
</template>

<script>
export default {
  data() {
    return {
      loginEmail: "",
      loginPassword: "",
    }
  },
  mounted() {
  },
  methods: {
    validateUser() {
      let errorString = ""
      if (!this.loginEmail?.trim()) {
        errorString = "Please enter your email"
        return [false, errorString]
      } if (!this.loginPassword?.trim()) {
        errorString = "Please enter your password"
        return [false, errorString]
      }
      return [true, ""]
    },
    loginUser() {
      if (!(this.validateUser()[0])) {
        alert(this.validateUser()[1])
      } else {
        this.axios.post(`http://localhost:4941/api/v1/users/login`, {
          "email": this.loginEmail,
          "password": this.loginPassword
        }).then((response) => {
          sessionStorage.setItem("token", response.data.token)
          sessionStorage.setItem("loggedInUserId", response.data.userId)
          sessionStorage.setItem("userPassword", this.loginPassword)
          alert("You are now logged in!")
          this.$router.push('/profile')
        }, (error) => {
          this.error = error;
          this.errorFlag = true;
          alert("Your email and or password is incorrect")
        });
      }
    },
  }
}
</script>

<style>
  #emailOfUser {
    width: 300px;
  }
  #inputPwUser {
    width: 300px;
  }
</style>
