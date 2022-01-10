<template>
  <div v-if="LoggedIn()">
    <router-link :to="{name: `home`}">
      <el-button>Home</el-button>
    </router-link>
    <router-link :to="{name: `events`}">
      <el-button>Events</el-button>
    </router-link>
    <router-link :to="{name: `profile`}">
      <el-button id="gotoProfile">Profile</el-button>
    </router-link>
    <el-button id="Logout" v-on:click="logoutUser">Logout</el-button>
    <router-link :to="{name: `createevent`}">
      <el-button id="createButton">Create an event</el-button>
    </router-link>  </div>
  <div v-else>
    <router-link :to="{name: `home`}">
      <el-button>Home</el-button>
    </router-link>
    <router-link :to="{name: `events`}">
      <el-button>Events</el-button>
    </router-link>
    <el-button id="registerbtn" v-on:click="$router.push('/register')">
      Register
    </el-button>
    <el-button id="loginbtn" v-on:click="$router.push(`/login`)">
      Login
    </el-button>
  </div>
    <div>
    <h1 style="color:black;font-size:40px;">Events</h1>
  </div>
  <div>
    <div v-if="errorFlag" style="color: red;">
      {{ error }}
    </div>
  </div>
    <link rel="stylesheet" href="mystyle.css">
  <div class="topnav">
    <el-input v-model="searchInput" type="text" placeholder="Search a key word or phrase.." ></el-input>
    <el-button type="submit" v-on:click=searchEvent>Search</el-button>
    <el-button type="submit" v-on:click=getEvents>View all events</el-button>
  </div>
  <div id="checkBoxes">
    <div class="filters">
      <el-checkbox-group  v-model="checkList" @change="filter">
        <el-checkbox v-for="cat in category" :label="cat.id" :key="cat.id">{{cat.name}}</el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
  <div id="sortByDropdown">
    <el-select v-model="currentSort" v-on:change="sortEvents(currentSort)">
      <el-option disabled value="">--Please select a sort--</el-option>
      <el-option value="ATTENDEES_ASC">Sort by attendees Ascending</el-option>
      <el-option value="ATTENDEES_DESC">Sort by attendees Descending</el-option>
      <el-option value="DATE_ASC">Sort events by latest to first date</el-option>
      <el-option value="DATE_DESC">Sort events by first to latest date</el-option>
    </el-select>
    <el-button v-on:click="getCombo()">
      Search combo
    </el-button>
  </div>
  <div id="allCards">
    <div id="eventCards" class="card" v-for="event in events.slice((this.page-1)*10, (this.page-1)*10 + 10)" v-bind:key="event.eventId">
          <h5>{{event.title}}</h5>
          <img id="eventImage" v-bind:src=getEventImageURL(event.eventId) onerror="this.onerror=null;this.src=`https://www.belfercenter.org/themes/belfer/images/event-default-img-med.png`;">
          <br>
          <img id="userImage" v-bind:src=getUserImage(event.eventId) onerror="this.onerror=null;this.src=`https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg`;">
            Host: {{event.organizerFirstName + " " + event.organizerLastName}}
            <br>Date: {{convertTime(event.date)}}
            <br>Categories: {{getEventCategories(event)}}
            <br>No. of Attendees: {{event.numAcceptedAttendees}}
            <br>
            <router-link :to="{name: `event`, params: {eventId: event.eventId}}">
              <el-button id="viewEventButton">View Event</el-button>
            </router-link>
    </div>
  </div>
  <el-pagination
      background
      layout="prev, pager, next"
      :page-size="10"
      :current-page="startPage"
      :total="events.length"
      v-on:current-change="changeCurrentPage">
  </el-pagination>
</template>

<script>
export default {
  data() {
    return{
      error: "",
      errorFlag: false,
      events: [],
      searchInput: "",
      category: [],
      eventCategory: {},
      filterString: "",
      filterDict: {},
      toggleCategories: {},
      eventImgUrl: "",
      checkList: [],
      currentSort: "",
      eventDetail: {},
      page: 1,
      numOfEvents: "",
      numOfPageItems: [],
      startPage: 1,
      authToken: sessionStorage.getItem('token')
    }
  },
  mounted() {
    // this.getEvents();
    this.getAllCategories();
  },
  methods: {
    getCombo() {
      let parameters = {

      }
      if (this.checkList.length != 0) {
        parameters["categoryIds"] = this.checkList
        console.log('1')
      }
      console.log(this.searchInput)
      if (!(this.searchInput) && this.searchInput != "") {
        console.log('2')
        parameters['q'] = this.searchInput
      }
      if (!(this.currentSort)) {
        console.log('3')
        parameters["sortBy"] = this.currentSort
      }

      this.axios.get('http://localhost:4941/api/v1/events', {params: parameters})
          .then((response) => {
            this.events = response.data
          }, () => {
            alert("You have an error in your input")
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
    changeCurrentPage(p) {
      this.page = p;
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
    getUserImage(eventId) {
      let userId = this.eventDetail[eventId].organizerId;
      return "http://localhost:4941/api/v1/users/" + userId + "/" + "image"
    },
    storeEventDetails() {
      for (let i=0; i < this.events.length; i++) {
        let currentEvent = this.events[i].eventId
        this.axios.get('http://localhost:4941/api/v1/events/' + currentEvent)
            .then((response) => {
              this.eventDetail[currentEvent] = response.data;
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      }
    },
    sortEvents (sortField) {
      if (sortField == "DATE_ASC") {
        this.axios.get('http://localhost:4941/api/v1/events?sortBy=' + "DATE_ASC")
            .then((response) => {
              this.events = response.data;
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      } else if (sortField == "DATE_DESC") {
        this.axios.get('http://localhost:4941/api/v1/events?sortBy=' + "DATE_DESC")
            .then((response) => {
              this.events = response.data;
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      } else if (sortField == "ATTENDEES_ASC") {
        this.axios.get('http://localhost:4941/api/v1/events?sortBy=' + "ATTENDEES_ASC")
            .then((response) => {
              this.events = response.data;
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      } else if (sortField == "ATTENDEES_DESC") {
        this.axios.get('http://localhost:4941/api/v1/events?sortBy=' + "ATTENDEES_DESC")
            .then((response) => {
              this.events = response.data;
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      }
    },
    filter() {
      this.filterCategories()
    },
    filterCategories() {
      let query = "?"
      for (let i=0; i<this.checkList.length; i++) {
        if (this.checkList.length == 0) {
          query += "?"
        } else if (i == this.checkList.length - 1) {
          query += "categoryIds=" + this.checkList[i]
        } else {
          query += "categoryIds=" + this.checkList[i] + "&"
        }
      }
      this.axios.get('http://localhost:4941/api/v1/events' + query)
          .then((response) => {
            this.events = response.data
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
    getEvents() {
      this.axios.get(`http://localhost:4941/api/v1/events?sortBy=DATE_ASC`)
          .then((response) => {
            this.events = response.data;
            this.numOfEvents = response.data.length
            this.storeEventDetails()
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    searchEvent() {
      if (this.searchInput == "") {
        this.getEvents()
      } else {
        this.axios.get('http://localhost:4941/api/v1/events/?q=' + this.searchInput)
            .then((response) => {
              this.events = response.data
            }, (error) => {
              this.error = error;
              this.errorFlag = true;
            });
      }
    },
    getAllCategories() {
      this.axios.get('http://localhost:4941/api/v1/events/categories')
          .then((response) => {
            this.category = response.data
            for (let i=0; i < this.category.length; i++) {
              this.eventCategory[this.category[i].id] = this.category[i].name
              this.toggleCategories[this.category[i].name] = false
            }
            this.getEvents()
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    getEventCategories(event) {
      let returnString = ""
      for (let i=0; i<event.categories.length; i++) {
        if (i == event.categories.length - 1) {
          returnString += this.eventCategory[event.categories[i]]
        } else {
          returnString += this.eventCategory[event.categories[i]] + "," + " "
        }
      }
      return returnString
    },
    getEventImageURL(eventid) {
      return 'http://localhost:4941/api/v1/events/' + eventid + `/image`
    },
    filteredGetEvents(filterString) {
      if (this.filterArray.includes(filterString) == false) {
        this.filterArray.push(filterString)
      }
      let filterIds = [];
      let query = ""
      for (let i=0; i < this.filterArray.length; i++) {
        filterIds.push(Object.keys(this.eventCategory).find(key => this.eventCategory[key] === this.filterArray[i]));
      }
      for (let i=0; i < filterIds.length; i++) {
        if (i == 0) {
          query += "?"
        } else if (i == filterIds.length - 1) {
          query += "categoryIds=" + filterIds[i].toString()
        } else {
          query += "categoryIds=" + filterIds[i].toString() + "&"
        }
      }
      this.axios.get('http://localhost:4941/api/v1/events' + query)
          .then((response) => {
            this.events = response.data
          });
    },
    getCombination() {

    }
  }
}
</script>

<style>
#loginbtn {
  margin-left: 0px;
}
#allCards {
  display: inline;
}
#eventCards.card {
  border: 0.1px solid black;
  height: 700px;
}
#eventCards {
  /* Add shadows to create the "card" effect */
  display: inline-flex;
  width: 250px;
  border-radius: 50px; /* 5px rounded corners */
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* this adds the "card" effect */
  padding: 16px;
  text-align: center;
  background-color: #f1f1f1;
}
#eventImage {
  border: 5px solid black;
  border-radius: 30%;
  /*border-radius: 5px 5px 0 0;*/
}
#userImage {
  height: 200px;
  border-radius: 50%;
  border: 5px solid black;
  /*display: block;*/
}
.pagination a {
  color: black;
  float: left;
  padding: 8px 16px;
  text-decoration: none;
}

.pagination a.active {
  background-color: #4CAF50;
  color: white;
  border-radius: 5px;
}

.pagination a:hover:not(.active) {
  background-color: #ddd;
  border-radius: 5px;
}
</style>