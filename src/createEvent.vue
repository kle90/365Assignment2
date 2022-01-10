<template>
  <router-link :to="{name: `home`}">
    <el-button>Home</el-button>
  </router-link>
  <router-link :to="{name: `events`}">
    <el-button>Events</el-button>
  </router-link>
    <el-button v-on:click="logoutUser">Logout</el-button>
  <router-link :to="{name: `profile`}">
    <el-button id="gotoProfile">Profile</el-button>
  </router-link>
  <div id="userCreateEventInputs">
    <el-input
        id="eventTitle"
        placeholder="Please input the title of the event"
        v-model="eventTitle"
        clearable>
    </el-input>
    <el-input
        id="createdEventdescription"
        placeholder="Please input the event description"
        v-model="eventDesc"
        clearable>
    </el-input>
    <el-input
        id="maxCap"
        type="number"
        placeholder="Please input the maximum capacity of the event"
        v-model="eventCapacity"
        clearable>
    </el-input>
    <el-input
        id="eventFee"
        type="number"
        placeholder="Please put the fee of the event. If free put 0."
        v-model="eventFee"
        clearable>
    </el-input>
    <br>
    <el-radio-group v-model="eventType">0
      <h4>Type of your event</h4>
      <el-radio label="online">Is an online event</el-radio>
      <el-radio label="person">Is an in-person event</el-radio>
    </el-radio-group>
    <div v-if="isInPerson()">
      <h>Venue</h>
      <el-input
          id="inPersonEvent"
          placeholder="Please put a venue for your event."
          v-model="eventVenue"
          clearable>
      </el-input>
      <h>Url (Optional)</h>
      <el-input
          id="OptionalUrl"
          placeholder="Please input URL (Optional)."
          v-model="inPersoneventURL"
          clearable>
      </el-input>
    </div>
    <div v-if="isOnline()">
      <h>URL</h>
      <el-input
          id="isOnlineEvent"
          placeholder="Please put a url for your event."
          v-model="eventURL"
          clearable>
      </el-input>
    </div>
    <br>
    <h3>Control attendance status?</h3>
    <p>If yes then the organizer must accept the pending join request else anyone can join</p>
    <el-radio-group v-model="controlAttendanceStatus">
      <el-radio label="yes">Yes</el-radio>
      <el-radio label="no">No</el-radio>
    </el-radio-group>
    <div class="block">
      <span class="demonstration"></span>
      <el-date-picker
          v-model="dateOfEvent"
          type="datetime"
          placeholder="Select date and time">
      </el-date-picker>
    </div>
    <br>
    <h4>Please select your event categories</h4>
    <div class="container">
      <div id="v-model-multiple-checkboxes">
      <span v-for="cat in allCategoriesDict" v-bind:key="cat[0]">
        <input type="checkbox" :value="cat" v-model="categoriesList"> <span class="checkbox-label"> {{cat}} </span> <br>
      </span>
      </div>
    </div>
    <br>
    <br>
    <br>
    <br>
    <br>
    <h2>Select an image for your event</h2>
    <input id="uploadedFile" type="file" name="myImage" accept="image/x-png,image/gif,image/jpeg" @change="storeImage($event)"/>
    <br>
<!--    <el-button v-on:click="uploadEventImage()">Upload event image</el-button>-->
    <el-button v-on:click="createEvent()">Create event!</el-button>
  </div>
</template>

<script>
export default {
    data() {
      return {
        dateOfEvent: null,
        inPersoneventURL: "",
        eventFee: "",
        eventCapacity: "",
        uploadedEventImg: null,
        categoriesList: [],
        allcategories: [],
        allCategoriesDict: {},
        allCategoriesDict2: {},
        eventDesc: "",
        eventCategories: "",
        eventTitle: "",
        eventDate: "",
        eventType: "",
        radio: 2,
        selected: "",
        controlAttendanceStatus: "",
        eventVenue: "",
        eventURL: "",
        eventInputData: {},
        createdeventid: ""
      }
    },
    mounted() {
      this.getAllCategories()
    },
    methods: {
      datePassed() {
        let eventdate = Date.parse(this.dateOfEvent)
        if (eventdate < Date.now()) {
          return true
        } else {
          false
        }
      },
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
      storeImage(event) {
        this.uploadedEventImg = event.target.files[0]
      },
      validateCreateEventInputs() {
        let errorString = ""
        if (!(this.eventTitle)) {
          errorString = "You must enter a title for your event."
          return [false, errorString]
        } if (!(this.eventDesc)) {
          errorString = "You must enter an event description"
          return [false, errorString]
        } if (!(this.eventCapacity)) {
          errorString = "You must enter the max capacity of the event"
          return [false, errorString]
        } if (!(this.eventFee)) {
          errorString = "You must enter fee of the event"
          return [false, errorString]
        } if (!(this.eventType)) {
          errorString = "You must choose an event type."
          return [false, errorString]
        } if (this.eventType == "online") {
          if (!(this.eventURL)) {
            errorString = "You must enter a url for your event."
            return [false, errorString]
          }
        } if (this.eventType == "person") {
          if (!(this.eventVenue)) {
            errorString = "You must enter a venue for you event."
            return [false, errorString]
          }
        } if (!(this.controlAttendanceStatus)) {
          errorString = "You must choose if you need to control the attendance status."
          return [false, errorString]
        } if (this.categoriesList.length == 0) {
          errorString = "You must pick atleast one category"
          return [false, errorString]
        } if (this.uploadedEventImg == null) {
          errorString = "You must enter an event image"
          return [false, errorString]
        } if (!(this.dateOfEvent)) {
          errorString = "You must enter an event date"
          return [false, errorString]
        } if (this.datePassed()) {
          errorString = "You must enter an event date that has not passed"
          return [false, errorString]
        }
        return [true, ""]
      },
      getAllCategories() {
        this.axios.get('http://localhost:4941/api/v1/events/categories')
            .then((response) => {
              this.allcategories = response.data
              for (let i=0; i < this.allcategories.length; i++) {
                this.allCategoriesDict[this.allcategories[i].id] = this.allcategories[i].name
                this.allCategoriesDict2[this.allcategories[i].name] = this.allcategories[i].id
              }
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      },
      createEvent() {
        if (!(this.validateCreateEventInputs()[0])) {
          alert(this.validateCreateEventInputs()[1])
        } else {
          console.log(sessionStorage.getItem('token'))
          console.log(this.uploadedEventImg.type)
          let eventheaders = {
            'Content-Type': "application/json",
            'X-Authorization': sessionStorage.getItem("token")
          }
          console.log("headers is ", eventheaders)
          let catIdArray = []
          for (let i=0; i<this.categoriesList.length; i++) {
            let catName = this.categoriesList[i]
            catIdArray.push(this.allCategoriesDict2[catName])
          }
          let eventData = ""
          let ctrlStatusParam = ""
          if (this.controlAttendanceStatus == "yes") {
            ctrlStatusParam = true
          } else {
            ctrlStatusParam = false
          }
          console.log(ctrlStatusParam)
          if (this.eventType == "online") {
            console.log("here 1")
            eventData = {
              "title": this.eventTitle,
              "description": this.eventDesc,
              "categoryIds": catIdArray,
              "date": "2025-04-23 18:25:43.511",
              "isOnline": true,
              "url": this.eventURL,
              "venue": this.eventVenue,
              "capacity": parseInt(this.eventCapacity),
              "requiresAttendanceControl": ctrlStatusParam,
              "fee": parseFloat(this.eventFee)
            }
          } else if (this.eventType == "person") {
            if (this.inPersoneventURL != "") {
              console.log("here 2")
              eventData = {
                "title": this.eventTitle,
                "description": this.eventDesc,
                "categoryIds": catIdArray,
                "date": "2025-04-23 18:25:43.511",
                "isOnline": true,
                "url": this.inPersoneventURL,
                "venue": this.eventVenue,
                "capacity": parseInt(this.eventCapacity),
                "requiresAttendanceControl": ctrlStatusParam,
                "fee": parseFloat(this.eventFee)
              }
            } else {
              console.log("here 3")
              eventData = {
                "title": this.eventTitle,
                "description": this.eventDesc,
                "categoryIds": catIdArray,
                "date": "2025-04-23 18:25:43.511",
                "isOnline": true,
                "venue": this.eventVenue,
                "capacity": parseInt(this.eventCapacity),
                "requiresAttendanceControl": ctrlStatusParam,
                "fee": parseFloat(this.eventFee)
              }
            }
          }
          console.log(eventData)
          this.axios.post(`http://localhost:4941/api/v1/events`, eventData, {headers: eventheaders})
              .then((response) => {
                console.log("res event id is ", response.data.eventId)
                console.log ("res is ", response.data)
                this.createdeventid = response.data.eventId;

                sessionStorage.setItem('createdEventId', response.data.eventId)
                let imageHeaders = {
                  'Content-Type': this.uploadedEventImg.type,
                  'X-Authorization': sessionStorage.getItem("token")
                }
                console.log(sessionStorage.getItem(`loggedInUserId`))
                console.log("image headers is ", imageHeaders)
                this.axios.put(`http://localhost:4941/api/v1/events/` + sessionStorage.getItem(`createdEventId`) + `/image`, this.uploadedEventImg, {headers: imageHeaders})
                    .then(() => {
                      console.log("image successfully uploaded")
                      alert("Your event has been created")
                      this.$router.push("/events/" + sessionStorage.getItem('createdEventId'))
                      // this.$router.push('/profile/' + this.$route.params.userId)
                    }, () => {
                      alert("something went wrong")
                    });
              }, (error) => {
                this.error = error;
                this.errorFlag = true;
              });
        }
      },
      isOnline () {
        console.log("event type is ", this.eventType)
        if (this.eventType == "online") {
          return true
        } else {
          return false
        }
      },
      isInPerson () {
        if (this.eventType == "person") {
          return true
        } else {
          return false
        }
      }
    }
  }
</script>

<style>
.container {
  position: fixed;
  border:2px solid #ccc;
  width:300px;
  height: 100px;
  overflow-y: scroll;
}

.dropdown-check-list .anchor:after {
  position: absolute;
  content: "";
  border-left: 2px solid black;
  border-top: 2px solid black;
  padding: 5px;
  right: 10px;
  top: 20%;
  -moz-transform: rotate(-135deg);
  -ms-transform: rotate(-135deg);
  -o-transform: rotate(-135deg);
  -webkit-transform: rotate(-135deg);
  transform: rotate(-135deg);
}

.dropdown-check-list .anchor:active:after {
  right: 8px;
  top: 21%;
}

#logoutButton {
    text-align: right;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>

  <!--  <el-menu :router="true" class="el-menu-demo" mode="horizontal">-->
  <!--    <el-menu-item index="1" :route="{name: `home`}">Home</el-menu-item>-->
  <!--    <el-menu-item index="2" :route="{name: `events`}">Events</el-menu-item>-->
  <!--    <div id="logoutButton" class="wrapper">-->
  <!--      <el-button v-on:click="logoutUser">Logout</el-button>-->
  <!--    </div>-->
  <!--  </el-menu>-->
  <!--  <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" class="demo-ruleForm">-->
  <!--    <el-form-item label="Event title" prop="eventtitle">-->
  <!--      <el-input v-model="ruleForm.eventtitle"></el-input>-->
  <!--    </el-form-item>-->
  <!--    <el-form-item label="Activity zone" prop="region">-->
  <!--      <el-select v-model="ruleForm.region" placeholder="Activity zone">-->
  <!--        <el-option label="Zone one" value="shanghai"></el-option>-->
  <!--        <el-option label="Zone two" value="beijing"></el-option>-->
  <!--      </el-select>-->
  <!--    </el-form-item>-->
  <!--    <el-form-item label="Activity time" required>-->
  <!--      <el-col :span="11">-->
  <!--        <el-form-item prop="date1">-->
  <!--          <el-date-picker type="date" placeholder="Pick a date" v-model="ruleForm.date1" style="width: 100%;"></el-date-picker>-->
  <!--        </el-form-item>-->
  <!--      </el-col>-->
  <!--      <el-col class="line" :span="2">-</el-col>-->
  <!--      <el-col :span="11">-->
  <!--        <el-form-item prop="date2">-->
  <!--          <el-time-picker placeholder="Pick a time" v-model="ruleForm.date2" style="width: 100%;"></el-time-picker>-->
  <!--        </el-form-item>-->
  <!--      </el-col>-->
  <!--    </el-form-item>-->
  <!--    <el-form-item label="Instant delivery" prop="delivery">-->
  <!--      <el-switch v-model="ruleForm.delivery"></el-switch>-->
  <!--    </el-form-item>-->
  <!--    <el-form-item label="Activity type" prop="type">-->
  <!--      <el-checkbox-group v-model="ruleForm.type">-->
  <!--        <el-checkbox label="Online activities" name="type"></el-checkbox>-->
  <!--        <el-checkbox label="Promotion activities" name="type"></el-checkbox>-->
  <!--        <el-checkbox label="Offline activities" name="type"></el-checkbox>-->
  <!--        <el-checkbox label="Simple brand exposure" name="type"></el-checkbox>-->
  <!--      </el-checkbox-group>-->
  <!--    </el-form-item>-->
  <!--    <el-form-item label="Resources" prop="resource">-->
  <!--      <el-radio-group v-model="ruleForm.resource">-->
  <!--        <el-radio label="Sponsorship"></el-radio>-->
  <!--        <el-radio label="Venue"></el-radio>-->
  <!--      </el-radio-group>-->
  <!--    </el-form-item>-->
  <!--    <el-form-item label="Activity form" prop="desc">-->
  <!--      <el-input type="textarea" v-model="ruleForm.desc"></el-input>-->
  <!--    </el-form-item>-->
  <!--    <el-form-item>-->
  <!--      <el-button type="primary" @click="submitForm('ruleForm')">Create</el-button>-->
  <!--      <el-button @click="resetForm('ruleForm')">Reset</el-button>-->
  <!--    </el-form-item>-->
  <!--  </el-form>-->
  <!--</template>-->

  <!--<script>-->
  <!--export default {-->
  <!--  data() {-->
  <!--    return {-->
  <!--      ruleForm: {-->
  <!--        eventtitle: '',-->
  <!--        region: '',-->
  <!--        date1: '',-->
  <!--        date2: '',-->
  <!--        delivery: false,-->
  <!--        type: [],-->
  <!--        resource: '',-->
  <!--        desc: ''-->
  <!--      },-->
  <!--      rules: {-->
  <!--        eventtitle: [-->
  <!--          { required: true, message: 'Please input Activity name', trigger: 'blur' },-->
  <!--          { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }-->
  <!--        ],-->
  <!--        region: [-->
  <!--          { required: true, message: 'Please select Activity zone', trigger: 'change' }-->
  <!--        ],-->
  <!--        date1: [-->
  <!--          { type: 'date', required: true, message: 'Please pick a date', trigger: 'change' }-->
  <!--        ],-->
  <!--        date2: [-->
  <!--          { type: 'date', required: true, message: 'Please pick a time', trigger: 'change' }-->
  <!--        ],-->
  <!--        type: [-->
  <!--          { type: 'array', required: true, message: 'Please select at least one activity type', trigger: 'change' }-->
  <!--        ],-->
  <!--        resource: [-->
  <!--          { required: true, message: 'Please select activity resource', trigger: 'change' }-->
  <!--        ],-->
  <!--        desc: [-->
  <!--          { required: true, message: 'Please input activity form', trigger: 'blur' }-->
  <!--        ]-->
  <!--      }-->
  <!--    };-->
  <!--  },-->
  <!--  methods: {-->
  <!--    submitForm(formName) {-->
  <!--      this.$refs[formName].validate((valid) => {-->
  <!--        if (valid) {-->
  <!--          alert('submit!');-->
  <!--        } else {-->
  <!--          console.log('error submit!!');-->
  <!--          return false;-->
  <!--        }-->
  <!--      });-->
  <!--    },-->
  <!--    resetForm(formName) {-->
  <!--      this.$refs[formName].resetFields();-->
  <!--    }-->
  <!--  }-->
  <!--}-->
