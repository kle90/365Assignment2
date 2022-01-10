<template>
  <el-menu :router="true" mode="horizontal">
    <el-menu-item index="1" :route="{name: `home`}">Home</el-menu-item>
    <el-menu-item index="2" :route="{name: `events`}">Events</el-menu-item>
    <el-menu-item index="3" :route="{name: `register`}">Register</el-menu-item>
    <el-menu-item index="4" :route="{name: `login`}">Login</el-menu-item>
<!--    use componenet for ^^^^-->
<!--        <div v-if="localStorage.getItem(token) ===``">-->
<!--      <el-button id="LogoutEnabled" v-on:click="logoutUser" disabled="false">Logout</el-button>-->
<!--    </div>-->
<!--    <div v-else>-->
<!--      <el-button id="LogoutDisabled" v-on:click="logoutUser" disabled="true">Logout</el-button>-->
<!--    </div>-->
<!--    <el-button id="Logout" v-on:click="logoutUser">Logout</el-button>-->
  </el-menu>
  <div id="userInputs">
    <el-input
        id="firstname"
        placeholder="Please input your first name"
        v-model="firstName"
        clearable>
    </el-input>
    <el-input
        id="lastname"
        placeholder="Please input your last name"
        v-model="lastName"
        clearable>
    </el-input>
    <el-input
        id="email"
        placeholder="Please input your valid email"
        v-model="email"
        clearable>
    </el-input>
    <el-input
        type="password"
        id="pword"
        placeholder="Please input your chosen password"
        v-model="inputpassword"
        clearable>
    </el-input>
    <el-button v-on:click="registerUser" type="primary" round>Register</el-button>
    <h2>Select an image</h2>
    <input id="uploadedFile" type="file" name="myImage" accept="image/x-png,image/gif,image/jpeg" @change="storeImage($event)"/>
<!--    <img id="blah" src="http://placehold.it/180" alt="your image" />-->
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      inputpassword: "",
      uploadedFile: null,
      userId: null,
      imgHeaders: null,
    }
  },
  mounted() {

  },
  methods: {
    // toggleTextVisibility() {
    //   const passwordField = document.querySelector('#pword')
    //   if (passwordField.getAttribute('type') === 'password') {
    //     passwordField.setAttribute('type', 'text')
    //   }
    //   else {
    //     passwordField.setAttribute('type', 'password')
    //   }
    // },
    validateUserDetails () {
      let errorString = ""
      if (!this.firstName?.trim()) {
        errorString = "Please enter your first name"
        return [false, errorString]
      } if (!this.lastName?.trim()) {
        errorString = "Please enter your last name"
        return [false, errorString]
      } if (!this.email?.trim()) {
        errorString = "Please enter your email"
        return [false, errorString]
      } if (!this.inputpassword?.trim()) {
        errorString = "Please enter a password"
        return [false, errorString]
      } if (this.email.includes("@") == false) {
        errorString = "Please enter a valid email"
        return [false, errorString]
      } if (this.inputpassword.length < 8) {
        errorString = "Password must be atleast 8 characters"
        return [false, errorString]
      }
      return [true, ""]
    },
    registerUser() {
      console.log("user id is", this.userId)
      if (!(this.validateUserDetails()[0])) {
        alert(this.validateUserDetails()[1])
      } else {
        this.axios.post('http://localhost:4941/api/v1/users/register', {
          "firstName": this.firstName,
          "lastName": this.lastName,
          "email": this.email,
          "password": this.inputpassword
        })
            .then((response) => {
              console.log("password is ", this.inputpassword)
              this.userId = response.data.userId
              this.loginUserOnceRegistered()
              console.log("new regsitered user id is ", this.userId)
              alert("You are now registered and are now logged in")
              console.log("response data is ", response.data.userId)
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
              alert("Your email is not valid")
            });
      }
    },
    loginUserOnceRegistered() {
      console.log("logged in")

      this.axios.post(`http://localhost:4941/api/v1/users/login`, {
        "email": this.email,
        "password": this.inputpassword
      }).then((response) => {
        console.log("response data is ", response.data.token)
        sessionStorage.setItem("token", response.data.token)
        sessionStorage.setItem("loggedInUserId", response.data.userId)

        if (this.uploadedFile != null) {
          let imageHeaders = {
            'Content-Type': this.uploadedFile.type,
            'X-Authorization': sessionStorage.getItem("token")
          }
          console.log("image headers is ", imageHeaders)
          this.axios.put(`http://localhost:4941/api/v1/users/` + this.userId + `/image`, this.uploadedFile, {headers: imageHeaders})
              .then(() => {
                this.$router.push('/profile/')
              }, () => {
                this.$router.push('/profile/')
              });
        }
        this.$router.push(`/profile`)
      })
    },
    storeImage(event) {
      this.uploadedFile = event.target.files[0]
      // this.imgHeaders = {
      //   'Content-Type': this.uploadedFile.type,
      //   'X-Authorization': localStorage.getItem("token")
      // }
    }
  }
}
</script>

<style>
  #LogoutEnabled {
    right: 1000px;
  }
  #firstname {
    width: 300px;
  }
  #lastname {
    width: 300px;
  }
  #email {
    width: 300px;
  }
  #pword {
    width: 300px;
  }
  #userInputs {
    right: 900px;
  }
</style>

