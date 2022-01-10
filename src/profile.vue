<template>
  <router-link :to="{name: `home`}">
    <el-button id="goHomebtn">Home</el-button>
  </router-link>
  <router-link :to="{name: `events`}">
    <el-button id="viewEventButton">Events</el-button>
  </router-link>
  <router-link :to="{name: `createevent`}">
    <el-button id="createEventbtn">Create an event</el-button>
  </router-link>
  <el-button id="logoutbtn" v-on:click="logoutUser">Logout</el-button>
  <el-card id="profileCard">
    <h1>{{firstName + " " + lastName}}</h1>

    <img id="profilePic" v-bind:src="getUserImage()" onerror="this.onerror=null;this.src=`https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg`;">
    <br>
    <h>User Email is {{info.email}}.</h>
    <br>
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#editUserModal">
      Edit your info
    </button>
    <div class="modal fade" id="editUserModal" tabindex="-1" role="dialog" aria-labelledby="editUserModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editUserModalLabel">Change your info</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <!--            <span aria-hidden="true">&times;</span>-->
            </button>
          </div>
          <div class="modal-body">
            <el-form>
              <el-form-item label="New First Name">
                <el-input
                    placeholder="Leave empty if you do not wish to change first name"
                    v-model="editForm.formFname">
                </el-input>
              </el-form-item>
              <el-form-item label="New Last Name">
                <el-input
                    placeholder="Leave empty if you do not wish to change last name"
                    v-model="editForm.formLname">
                </el-input>
              </el-form-item>
              <el-form-item label="New email">
                <el-input
                    placeholder="Leave empty if you do not wish to change email"
                    v-model="editForm.formEmail">
                </el-input>
              </el-form-item>
              <el-form-item label="Current password">
                <el-input
                    type="password"
                    placeholder="Provide your current password to make a new password"
                    v-model="editForm.formCurrentPassword"></el-input>
              </el-form-item>
              <el-form-item label="New password">
                <el-input
                    type="password"
                    placeholder="Enter your new password"
                    v-model="editForm.formNewPassword">
                </el-input>
              </el-form-item>
              <el-button id="editbtn" v-on:click="editInfo">
                Make Changes
              </el-button>
            </el-form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <input id="uploadedFileInModal" type="file" name="myImage" accept="image/x-png,image/gif,image/jpeg" @change="storeImage($event)"/>
    <br>
    <el-button v-on:click="uploadImage">
      Upload your image
    </el-button>
    <el-button v-on:click="deleteImage()">
      Delete you image
    </el-button>
    <!-- Trigger the modal with a button -->
    <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Events attending</button>

    <!-- Modal -->
    <div id="myModal" class="modal fade" role="dialog">
      <div class="modal-dialog">
        <!-- Modal content-->
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title">Attending events</h4>
          </div>
          <div class="modal-body">
            <ul id="similarEvents">
              <li v-for="atten in attendeeEvents" v-bind:key="atten.eventId">
                {{ atten.title }}
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </el-card>
<!--  {{attendeeEvents}}-->
<!--  {{allSingleEvents[1]}}-->
</template>

<script>
export default {
  data() {
    return {
      attendeeEvents: [],
      allevents: [],
      allSingleEvents: [],
      info: "",
      firstName: "",
      lastName: "",
      email: "",
      allAttendees: [],
      password: "",
      uploadedFile: null,
      imgHeaders: null,
      eventTitle: "",
      createdEventCategories: "",
      createdEventDate: "",
      attendees: [],
      attendeeInfo: {},
      acceptedAttendees: [],
      singleEvent: [],
      editData: {},
      editForm: {
        formFname: "",
        formLname: "",
        formEmail: "",
        uploadedFormFile: null,
        formCurrentPassword: "",
        formNewPassword: ""
      },
    };
  },
  mounted() {
    this.getLoggedInUser()
    this.getEvents()
  },
  methods: {
    getEventsThatUserIsIn() {
      this.allevents.forEach(event => {
        this.axios.get('http://localhost:4941/api/v1/events/' + event.eventId + '/attendees')
        .then((response) => {
          response.data.forEach(attendee => {
            if (attendee.attendeeId == sessionStorage.getItem('loggedInUserId')) {
              this.attendeeEvents.push(event);
            }
          })
        })
      }
      )
      console.log(this.attendeeEvents)
      // for (let i=0; i<this.allSingleEvents.length; i++) {
      //   for (let j=0; j<this.allSingleEvents[i].length; j++) {
      //     if (this.allSingleEvents[i][j].attendeeId == sessionStorage.getItem('loggedInUserId')) {
      //       this.attendeeEvents.push(this.allSingleEvents[i].eventId)
      //     }
      //   }
      // }
    },
    deleteImage() {
      let header = {
        'X-Authorization': sessionStorage.getItem("token")
      }
      this.axios.get('http://localhost:4941/api/v1/events/' + sessionStorage.getItem('loggedInUserId') + "/image", {headers: header})
          .then(() => {
            alert("Image deleted")
          }, (error) => {
            if (error.response.status == 404) {
              alert("You can not delete the default image")
            } else {
              alert("an error has occured")
            }
          });
    },
    getOneEvent() {
      for (let i=0; i<this.allevents.length;i++) {
        this.axios.get('http://localhost:4941/api/v1/events/' + this.allevents[i].eventId + "/attendees")
            .then((response) => {
              console.log(this.allevents[i].eventId)
              this.singleEvent = response.data;
              this.allSingleEvents[this.allevents[i].eventId] = (response.data)
              if (this.singleEvent.organizerId == sessionStorage.getItem('loggedInUserId')) {
                this.attendeeInfo[this.singleEvent.title] = "organizer"
              }
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      }
      this.getEventsThatUserIsIn()
    },
    getEvents() {
      this.axios.get(`http://localhost:4941/api/v1/events`)
          .then((response) => {
            this.allevents = response.data;
            console.log("events are ", this.allEvents)
            this.getOneEvent()
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    // getAllAttendees() {
    //   for (let i=0; i<this.allevents.length; i++) {
    //
    //     this.axios.get(`http://localhost:4941/api/v1/events/` + this.allevents[i].eventId + '/attendees')
    //         .then((response) => {
    //           this.attendees = response.data
    //           this.allAttendees.push(response.data)
    //           console.log("data is ", response.data)
    //           for (let i=0; i<this.attendees.length; i++) {
    //             if (sessionStorage.getItem(`loggedInUserId`) == this.attendees[i].attendeeId) {
    //               console.log("event is ", this.allevents[i].title)
    //               console.log("event is ", this.allevents[i].eventId)
    //               console.log("attens are ", this.attendees)
    //               console.log("session userid is ", sessionStorage.getItem(`loggedInUserId`))
    //               console.log("atten id is ", this.attendees[i].attendeeId)
    //               if (this.attendees[i].status == "accepted") {
    //                 console.log("here olo", i)
    //                 this.attendeeInfo[this.allevents[i].title] = "attendee"
    //                 // this.attendeeInfo.push(this.allevents[i].eventId)
    //               }
    //             }
    //             if (this.attendees[i].status == "accepted") {
    //               this.acceptedAttendees.push(this.attendees[i])
    //             }
    //           }
    //           this.sortObject()
    //         }, (error) => {
    //           this.error = error;
    //           this.errorFlag = true;
    //         });
    //   }
    // },
    gotoAllEventspg() {
      this.$router.push('/events')
    },
    uploadImage() {
      if (this.uploadedFile != null) {
        let imageHeaders = {
          'Content-Type': this.uploadedFile.type,
          'X-Authorization': sessionStorage.getItem("token")
        }
        console.log(sessionStorage.getItem(`loggedInUserId`))
        console.log("image headers is ", imageHeaders)
        this.axios.put(`http://localhost:4941/api/v1/users/` + sessionStorage.getItem(`loggedInUserId`) + `/image`, this.uploadedFile, {headers: imageHeaders})
            .then(() => {
              console.log("image successfully uploaded")
              // this.$router.push('/profile/' + this.$route.params.userId)
            }, () => {
              // this.$router.push('/profile/' + this.$route.params.userId)
            });
      } else {
          alert("please select a file to upload")
      }
    },
    storeImage(event) {
      this.uploadedFile = event.target.files[0]
    },
    editInfo() {
      if (this.editForm.formFname) {
        this.editData["firstName"] = this.editForm.formFname
      } if (this.editForm.formLname) {
        this.editData["lastName"] = this.editForm.formLname
      } if (this.editForm.formEmail) {
        this.editData["email"] = this.editForm.formEmail
      } if (this.editForm.formCurrentPassword) {
          if (this.editForm.formNewPassword) {
            this.editData["password"] = this.editForm.formNewPassword
            this.editData["currentPassword"] = this.editForm.formCurrentPassword
          } else {
            alert("Please also enter your new password")
            return
          }
      }
      console.log("edit data is ", this.editData)
      let header = {
        'Content-Type': "application/json",
        'X-Authorization': sessionStorage.getItem("token")
      }
      console.log("header is ", header)
      console.log("is x auth the same in db? ", sessionStorage.getItem('token'))
      this.axios.patch(`http://localhost:4941/api/v1/users/` + sessionStorage.getItem('loggedInUserId'), this.editData, {headers: header})
          .then(() => {
            console.log("response is ", )
            alert("Edit successsful")
          }, (error) => {
            if (error.response.status == 400) {
              alert("Error: email already in use")
            } else {
              alert("Another error occured")
            }
          });
    },
    getLoggedInUser() {
      this.axios.get(`http://localhost:4941/api/v1/users/` + sessionStorage.getItem('loggedInUserId'), {headers: {'x-authorization': sessionStorage.getItem('token')}})
          .then((response) => {
            this.info = response.data
            this.firstName = response.data.firstName
            this.lastName = response.data.lastName
            this.email = response.data.email
            // this.firstName = response.data.firs
      });
    },
    logoutUser() {
      const headers = {
        'X-Authorization': sessionStorage.getItem("token")
      }
      this.axios.post(`http://localhost:4941/api/v1/users/logout`, {}, {headers: headers})
          .then((response) => {
            console.log("the status is ", response.status)
            sessionStorage.clear()
            console.log("inside first if is", sessionStorage.getItem("token"))
            alert("You are now logged out.")
            this.$router.push('/')
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
            alert("you are not authorized")
          });
    },
    getUserImage() {
      console.log("image is ", "http://localhost:4941/api/v1/users/" + sessionStorage.getItem(`loggedInUserId`) + "/" + "image")
      return "http://localhost:4941/api/v1/users/" + sessionStorage.getItem(`loggedInUserId`) + "/" + "image"
    },
  }
}
</script>

<style>
  #logoutbtn {
    display: inline;
    right: 1000px;
  }
  #profileCard {
    position: center;
  }
  #editbtn {
    border: 0.1px solid black;
  }
  /*#logoutButton {*/
  /*  text-align: right;*/
  /*}*/
  #profilePic {
    width: 250px;
    height: 250px;
  }

  /*.wrapper {*/
  /*  */
  /*}*/

  /*.button {*/
  /*  position: absolute;*/
  /*  top: 50%;*/
  /*}*/
</style>