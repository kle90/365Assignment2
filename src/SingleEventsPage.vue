<template>
  <el-menu :router="true" :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
    <el-menu-item index="1" :route="{name: `home`}">Home</el-menu-item>
    <el-menu-item index="2" :route="{name: `events`}">Events</el-menu-item>
  </el-menu>
  <div v-if="LoggedIn()">
    <router-link :to="{name: `profile`}">
      <el-button id="gotoprofilebtn">Goto profile</el-button>
    </router-link>
    <el-button id="Logout" v-on:click="logoutUser">Logout</el-button>
    <router-link :to="{name: `profile`}">
      <el-button id="gotoprofilebtn">Goto profile</el-button>
    </router-link>
    <el-button id="createAnEventButton" v-on:click="gotoCreateEvent()">create an event</el-button>
  </div>
  <div v-else>
    <router-link :to="{name: `register`}">
      <el-button>Register</el-button>
    </router-link>
    <router-link :to="{name: `login`}">
      <el-button>Login</el-button>
    </router-link>
  </div>
  <div id="details">
    <el-card id="eventCard" class="box-card">
      <template #header>
        <div class="user-card-header">
          <h1 id="eventTitle">{{singleEvent.title}}</h1>
        </div>
      </template>
      <img id="singleeventImage" v-bind:src=getEventImageURL($route.params.eventId) onerror="this.onerror=null;this.src=`https://wallpapercave.com/wp/wp4265350.jpg`;">
      <br>The Organizer of this event is {{singleEvent.organizerFirstName + " " + singleEvent.organizerLastName}}
      <br>
      <br>
      <img id="organizerImage" v-bind:src=getUserImage(singleEvent.organizerId) onerror="this.src=`https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg`;">
      <br>
      <br>Categories of this event are {{getEventCategories()}}
      <br>Description:
      <br>{{singleEvent.description}}
      <br>Number of Accepted attendees: {{singleEvent.attendeeCount}}
      <br>
      <div v-if="singleEvent.requiresAttendanceControl == 1">
        Attendance control needed
      </div>
      <div v-else>
        Attendance control not needed
      </div>
      <br>Accepted attendees:
      <ul id="attendees">
        <li id="attendeenames" v-for="user in acceptedAttendees" :key="user.attendeeId">
          <img id="attendeeImage" v-bind:src=getUserImage(user.attendeeId) onerror="this.onerror=null;this.src=`https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg`;">
          {{ user.firstName + " " + user.lastName + " " + userOrAttendee(user.attendeeId) }}
        </li>
      </ul>
      <br>Event URL: {{singleEvent.url}}
      <br>Venue: {{singleEvent.venue}}
      <br>Max capacity: {{singleEvent.capacity}}
      <br>Fee: {{'$'+ singleEvent.fee}}
      <br>Date: {{convertTime(singleEvent.date)}}
      <br>
      <!-- Trigger the modal with a button -->
      <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#similarEventsModal">View Similar Events</button>
      <!-- Modal -->
      <div id="similarEventsModal" class="modal fade" role="dialog">
        <div class="modal-dialog">
          <!-- Modal content-->
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title">Events that have similar categories</h4>
            </div>
            <div class="modal-body">
              <ul id="similarEvents">
                <li v-for="event in similarEvents" :key="event">
                  {{ event }}
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
  </div>
  <div v-if="checkIfEventFull()">
    Event is full sorry.
    <el-button v-on:click="requestAttendance()" disabled>
      Request attendance
    </el-button>
  </div>
  <div v-else>
    <div v-if="checkIfUserIsAttendee()">
      <el-button v-on:click="cancelAttendance">
        Cancel attendance
      </el-button>
    </div>
    <div v-else>
      <el-button v-on:click="requestAttendance">
        Request attendance
      </el-button>
    </div>
  </div>
  <div v-if="isTheOrganizer()">
    <div v-if="eventNotExpired()">
      <!--Control attendance Modal-->
      <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#ctrlAttendanceModal">Control attendance</button>
      <!-- Modal -->
      <div id="ctrlAttendanceModal" class="modal fade" role="dialog">
        <div class="modal-dialog">
          <!-- Modal content-->
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title">Attendance requests</h4>
            </div>
            <div class="modal-body">
              <table class="table table-striped table-bordered">
                <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Accept</th>
                  <th>Reject</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="atten in attendees" v-bind:key="atten.attendeeId">
                  <td>{{atten.firstName}} {{atten.lastName}}</td>
                  <td>{{atten.status}}</td>
                  <td>
                    <el-button v-on:click="acceptBtn(atten)">
                      Accept
                    </el-button>
                  </td>
                  <td>
                    <el-button v-on:click="rejectBtn(atten)">
                      Reject
                    </el-button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <!--Delete Modal-->
      <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#deleteModal">Delete event</button>
      <!-- Modal -->
      <div id="deleteModal" class="modal fade" role="dialog">
        <div class="modal-dialog">
          <!-- Modal content-->
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title">Are you sure you want to delete?</h4>
            </div>
            <div class="modal-body">
              <el-button v-on:click="deleteUserEvent()">
                Yes delete this event
              </el-button>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <!--Edit Modal-->
      <button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#editModal">Edit event</button>
      <!-- Modal -->
      <div id="editModal" class="modal fade" role="dialog">
        <div class="modal-dialog">
          <!-- Modal content-->
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal">&times;</button>
              <h4 class="modal-title"></h4>
            </div>
            <div class="modal-body">
              <el-form>
                <el-form-item label="Edit event title">
                  <el-input
                      placeholder="Enter your new event title"
                      v-model="editTitle">
                  </el-input>
                </el-form-item>
                <el-form-item label="Edit description">
                  <el-input
                      placeholder="Enter your new event description"
                      v-model="editDesc">
                  </el-input>
                </el-form-item>
                <el-form-item label="Edit URL">
                  <el-input
                      placeholder="Enter URL here"
                      v-model="editURL">
                  </el-input>
                </el-form-item>
                <el-form-item label="Edit Venue">
                  <el-input
                      placeholder="Enter Venue here"
                      v-model="editVenue">
                  </el-input>
                </el-form-item>
                <el-form-item label="Edit fee">
                  <el-input
                      placeholder="Enter fee here"
                      v-model="editFee">
                  </el-input>
                </el-form-item>
                <el-form-item label="Edit capacity">
                  <el-input
                      placeholder="Enter capacity here"
                      v-model="editCap">
                  </el-input>
                </el-form-item>
                Requires attendance control?
                <el-form-item>
                  <el-radio-group v-model="editCtrlAttendanceStatus">
                    <el-radio label="yes">Yes</el-radio>
                    <el-radio label="no">No</el-radio>
                  </el-radio-group>
                </el-form-item>
                Pick type of event
                <el-form-item>
                  <el-radio-group v-model="editEventType">
                    Type of your event
                    <el-radio label="online">online event</el-radio>
                    <el-radio label="person">in-person event</el-radio>
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
                </el-form-item>
                <el-form-item>
                  <el-scrollbar height="200px">
                    <el-checkbox-group  v-model="editCatList">
                      <el-checkbox v-for="cat in eventCategory" :key="cat.id">{{cat}}</el-checkbox>
                    </el-checkbox-group>
                  </el-scrollbar>
                </el-form-item>
                Edit Date
                <el-form-item>
                  <el-input type="date" v-model="editDate"></el-input>
                </el-form-item>
                Edit Time
                <el-form-item>
                  <el-input type="time" v-model="editTime"></el-input>
                </el-form-item>
              </el-form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <!--Delete Modal-->
      Can not delete an event that has already passed
      <br>
      <button type="button" disabled class="btn btn-info btn-lg" data-toggle="modal" data-target="#deleteModal">Delete event</button>
      <br>
      Can not edit an event that has already passed
      <br>
      <button type="button" disabled class="btn btn-info btn-lg" data-toggle="modal" data-target="#editModal">Edit event</button>
    </div>
  </div>
</template>

<script>
export default {
  // components: {CardFormat},
  data() {
    return {
      value2: true,
      editCatList: [],
      editEventType: "",
      editTime: "",
      editDate: "",
      editDay: "",
      editYeah: "",
      editMonth: "",
      editCtrlAttendanceStatus: "",
      editCap: "",
      editFee: "",
      editVenue: "",
      editURL: "",
      editTitle: "",
      editDesc: "",
      error: "",
      errorFlag: false,
      singleEvent: Object,
      singleEventDetail: [],
      category: [],
      eventCategory: {},
      eventCategory2: {},
      eventcat: [],
      acceptedAttendees: [],
      attendees: [],
      allEvents: [],
      similarEvents: new Set()
    }
  },
  mounted() {
    this.getOneEvent();
    this.getAllAttendess();
    this.getEvents();
  },
  methods: {
    gotoCreateEvent() {
      this.$router.push('/createEvent')
    },
    cancelAttendance() {
      let cancelAttendanceHeader = {
        'X-Authorization': sessionStorage.getItem("token")
      }
      this.axios.delete(`http://localhost:4941/api/v1/events/` + this.$route.params.eventId + "/attendees/", {headers: cancelAttendanceHeader})
          .then((response) => {
            console.log(response.status)
            alert("You have canceled your attendance")
            this.$router.go(0)
          }, (error) => {
            console.log("error is ", error.response.status)
            alert("something went wrong")
          });
    },
    checkIfUserIsAttendee() {
      for (let i=0; i<this.acceptedAttendees.length; i++) {
        if (sessionStorage.getItem('loggedInUserId') == this.acceptedAttendees[i].attendeeId) {
          return true
        }
      }
      return false
    },
    eventNotExpired() {
      let eventdate = Date.parse(this.singleEvent.date)
      if (eventdate > Date.now()) {
        return true
      } else {
        return false
      }
    },
    checkIfEventFull() {
      if (Array.from(this.acceptedAttendees).length == this.singleEvent.capacity) {
        return true
      } else if (this.singleEvent.capacity == null) {
        return false
      } else {
        return false
      }
    },
    requestAttendance() {
      if (sessionStorage.getItem('token') == null) {
        alert("Please log in or register to request attendance to this event")
      } else {
        let headers = {
          'X-Authorization': sessionStorage.getItem("token")
        }
        let data = {}
        if (this.singleEvent.requiresAttendanceControl == 1) {
          data = {
            "status": "pending"
          }
        } else {
          data = {
            "status": "accepted"
          }
        }
        console.log(data)
        this.axios.post(`http://localhost:4941/api/v1/events/` + this.$route.params.eventId + "/attendees/", {}, {headers: headers})
            .then((response) => {
              console.log(response.status)
              if (data["status"] == "pending") {
                alert("Your request is pending")
              } else {
                alert("Your request is successful")
              }
              this.$router.go(0)
            }, (error) => {
              console.log("error is ", error.response.status)
              if (error.response.status == 403) {
                alert("Either you are already in this event or the event hs already finished.")
              } else {
                alert("you are not authorized")
              }
            });
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
            console.log("inside first if is", sessionStorage.getItem("token"))
            alert("You are now logged out.")
            this.$router.push('/')
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
            alert("you are not authorized")
          });
    },
    acceptBtn(atten) {
      if (atten.status == "accepted") {
        alert("you are already accepted")
        return
      } else {
        if (atten.status == "pending") {
          this.singleEvent.attendeeCount += 1;
        }
        atten.status = 'accepted'
        let reqBody = {
          "status": "accepted"
        }
        let attenUserId = atten.attendeeId
        let acceptHeaders = {
          'Content-Type': "application/json",
          'X-Authorization': sessionStorage.getItem("token")
        }
        console.log(this.$route.params.eventId)
        this.axios.patch('http://localhost:4941/api/v1/events/' + this.$route.params.eventId + "/attendees/" + attenUserId, reqBody, {headers: acceptHeaders})
            .then(() => {
              alert("You have updated this attendee")
            }, () => {
              alert("something hwent wrong")
            });
      }
    },
    rejectBtn(atten) {
      if (atten.status == "rejected") {
        alert("you are already rejected")
        return
      } else {
        atten.status = 'rejected'
        let reqBody = {
          "status": "rejected"
        }
        let attenUserId = atten.attendeeId
        let acceptHeaders = {
          'Content-Type': "application/json",
          'X-Authorization': sessionStorage.getItem("token")
        }
        console.log("the router params is ", this.$route.params.eventId)
        this.axios.patch('http://localhost:4941/api/v1/events/' + this.$route.params.eventId + "/attendees/" + attenUserId, reqBody, {headers: acceptHeaders})
            .then(() => {
              alert("You have updated this attendee")
            }, () => {
              alert("something hwent wrong")
            });
      }
    },
    sortObject() {
      this.attendees.sort(function(a,b) {
        var dateA = new Date(a.dateOfInterest), dateB = new Date(b.dateOfInterest);
        return dateA - dateB;
      })
    },
    currentEventIsInPerson () {
      if (this.singleEvent.isOnline == 0) {
        return true
      } else {
        return false
      }
    },
    isOnline () {
      console.log("event type is ", this.editEventType)
      if (this.editEventType == "online") {
        return true
      } else {
        return false
      }
    },
    isInPerson () {
      if (this.editEventType == "person") {
        return true
      } else {
        return false
      }
    },
    deleteUserEvent() {
      let deleteEventHeaders = {
          'Content-Type': "application/json",
          'X-Authorization': sessionStorage.getItem("token")
      }
      let eventId = this.singleEvent.id
      console.log('toke is ', sessionStorage.getItem('token'))
      console.log("event id is ", eventId)
      console.log('headers is ', deleteEventHeaders)
      this.axios.delete('http://localhost:4941/api/v1/events/' + eventId, {headers: deleteEventHeaders})
          .then(() => {
            alert("Event had been deleted")
            this.$router.push('/events')
          }, () => {
            alert("something hwent wrong")
          });
    },
    isTheOrganizer() {
      if (sessionStorage.getItem(`loggedInUserId`) == this.singleEvent.organizerId) {
        return true
      } else {
        return false
      }
    },
    getEvents() {
      this.axios.get(`http://localhost:4941/api/v1/events?sortBy=DATE_ASC`)
          .then((response) => {
            this.allEvents = response.data;
            console.log("events are ", this.allEvents)
            // this.allEvents
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
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
    userOrAttendee(userId) {
      if (userId == this.singleEvent.organizerId) {
        return "(Role: Organizer)"
      } else {
        return "(Role: Attendee)"
      }
    },
    getUserImage(userId) {
      console.log("image is ", "http://localhost:4941/api/v1/users/" + userId + "/" + "image")
      return "http://localhost:4941/api/v1/users/" + userId + "/" + "image"
    },
    getAllAttendess() {
      this.axios.get(`http://localhost:4941/api/v1/events/` + this.$route.params.eventId + '/attendees')
          .then((response) => {
            console.log("event id is ???????????????????????????????????????", this.$route.params.eventId )
            this.attendees = response.data
            console.log("this dot attendees are ", this.attendees)
            for (let i=0; i<this.attendees.length; i++) {
              if (this.attendees[i].status == "accepted") {
                if (this.acceptedAttendees.includes(this.attendees[i]) != true) {
                  this.acceptedAttendees.push(this.attendees[i])
                }
              }
            }
            this.sortObject()
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    convertTime(date) {
      let newDate = new Date(date)
      newDate.setHours(newDate.getHours() + 13)
      return newDate.toUTCString().slice(0, -3) + "NZDT"
    },
    getOneEvent() {
      this.axios.get('http://localhost:4941/api/v1/events/' + this.$route.params.eventId)
          .then((response) => {
            this.singleEvent = response.data;
            this.eventcat = response.data.categories
            this.getAllCategories()
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    getEventImageURL(eventid) {
      return 'http://localhost:4941/api/v1/events/' + eventid + `/image`
    },
    getSimilarEvents () {
      console.log("here")
      console.log(this.allEvents)
      for (let i=0; i<this.allEvents.length; i++) {
        // console.log("here 2", this.allEvents.length)
        console.log("here 3", this.allEvents[i].title)
        for (let k=0; k<this.allEvents[i].categories.length; k++) {
          console.log("current k is ", k)
          if (this.singleEvent.categories.includes(this.allEvents[i].categories[k])) {
            console.log("added")
            this.similarEvents.add(this.allEvents[i].title)
          } else {
            console.log("ignored")
          }
        }
      }
    },
    getAllCategories() {
      this.axios.get('http://localhost:4941/api/v1/events/categories')
          .then((response) => {
            this.category = response.data
            for (let i=0; i < this.category.length; i++) {
              this.eventCategory[this.category[i].id] = this.category[i].name
              this.eventCategory2[this.category[i].name] = this.category[i].id
            }
            this.getSimilarEvents();
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    getEventCategories() {
      let returnString = ""
      console.log("categories is ", this.eventcat)
      for (let i=0; i<this.eventcat.length; i++) {
        if (i == this.eventcat.length - 1) {
          returnString += this.eventCategory[this.eventcat[i]]
        } else {
          returnString += this.eventCategory[this.eventcat[i]] + "," + " "
        }
      }
      return returnString
    },
  }
}

</script>

<style>
  #eventTitle {
    position: center;
  }
  #singleeventImage {
    width: 500px;
    height: 500px;
  }
  #details {
    position: center;
  }
  #organizerImage {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
  #attendeeImage {
    border-radius: 50%;
    width: 50px;
    height: 50px;
  }
  /*#eventCard {*/
  /*  display: flex;*/
  /*}*/
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 100px;
  }

  /*.box-card {*/
  /*  width: 480px;*/
  /*}*/
</style>

