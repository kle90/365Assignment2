<template>
  <div>
    <div id="regandlog" v-if="LoggedIn()">
      <router-link :to="{name: `home`}">
        <el-button id="goHomebtn">Home</el-button>
      </router-link>
      <router-link :to="{name: `events`}">
        <el-button id="viewEvents">Events</el-button>
      </router-link>
      <router-link :to="{name: `profile`}">
        <el-button id="gotoProfile">Profile</el-button>
      </router-link>
      <el-button id="Logout" v-on:click="logoutUser">Logout</el-button>
      <router-link :to="{name: `createevent`}">
        <el-button id="viewEventButton">Create an event</el-button>
      </router-link>
    </div>
    <div v-else>
      <router-link :to="{name: `home`}">
        <el-button id="goHomebtn">Home</el-button>
      </router-link>
      <router-link :to="{name: `events`}">
        <el-button id="viewEvents">Events</el-button>
      </router-link>
      <router-link :to="{name: `register`}">
        <el-button>Register</el-button>
      </router-link>
      <router-link :to="{name: `login`}">
        <el-button>Login</el-button>
      </router-link>
    </div>
  </div>
  <div>
    Home Page
  </div>
  <img src="">
</template>

<script>
export default {
  data() {
    return {
      info: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      uploadedFile: null,
      // loginBtUseP: false
      userId: null,
      imgHeaders: null,
      authToken: sessionStorage.getItem('token')
    }
  },
  mounted() {
    this.LoggedIn
  },
  methods: {
    logoutUser() {
      const headers = {
        'X-Authorization': sessionStorage.getItem("token")
      }
      this.axios.post(`http://localhost:4941/api/v1/users/logout`, {}, {headers: headers})
          .then((response) => {
            console.log("the status is ", response.status)
            sessionStorage.clear()
            alert("You are now logged out.")
            // this.LoggedIn()
            this.$router.push('/')
          }, () => {
            // this.error = error;
            // this.errorFlag = true;
            alert("you are not Logged in")
          });
    },
    LoggedIn() {
      console.log("in checked if logged in ", sessionStorage.getItem("token") == null)
      console.log(sessionStorage.getItem("token"))
      if (sessionStorage.getItem("token") != null) {
        //logged in
        return true
      } else {
        return false
      }
    },
  }
}
</script>
<style>
  #tabs {
    width: 900px;
  }
</style>