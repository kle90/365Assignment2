<template>
  <div id="events">
    <div class="column">
      <div class="card" style="width: 18rem;">
        <div class="card-body">
          <v-card-title primary-title class="justify-center">
            <div>
              <h5 class="card-title"><b>{{Event.title}}</b></h5>
            </div>
          </v-card-title>
          <img v-bind:src=getEventImageURL(Event.eventId)>
          <v-card-text class="justify-center">
<!--            <br>Organizer: {{Event.organizerFirstName + " " + Event.organizerLastName}}-->
            event is sfsafds {{ Categories[Event.categories[0]]}}
            {{Categories}}
            {{events}}
            {{typeof Event.categories[0]}}
<!--            <br>title is {{Event.eventDetails.organizerId}}-->
<!--            <img v-bind:src=getUserImagesURL(Event.eventDetails.organizerId)>-->
<!--            <br>Categories: {{getEventCategories(Categories)}}-->
<!--            <br>Number of attendees: {{Event.numAcceptedAttendees}}-->
          </v-card-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    Event: [],
    Categories: Object
  },
  data() {
    return {
      events: Event,
      error: "",
      errorFlag: false,
      eventCategory: {},
      eventImgUrl: "",
      userImgUrl: "",
      eventDetails: []
    }
  },
  mounted() {
    // this.storeEventDetails()
  },
  methods: {
    storeEventDetails(Event) {
      let eventNum = Event.eventId
      this.axios.get('http://localhost:4941/api/v1/events/' + eventNum)
          .then((response) => {
            console.log("response is ", response)
            this.eventDetails = response.data;
            // vue.set(this.events, i, JSON.parse(JSON.stringify(response.data)))
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
          });
    },
    getEventImageURL(eventid) {
      this.axios.get('http://localhost:4941/api/v1/events/' + eventid + `/image`)
          .then((response) => {
            if (response.status != 404) {
              this.eventImgUrl = 'http://localhost:4941/api/v1/events/' + eventid + `/image`
            }
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
            this.eventImgUrl = `https://wallpapercave.com/wp/wp4265350.jpg`
          });
      return this.eventImgUrl
    },

    getUserImagesURL(userId) {
      console.log("user is ", userId)

      this.axios.get('http://localhost:4941/api/v1/users/' + userId + '/image')
          .then((response) => {
            console.log("res is ", response)
            if (response.status != 404) {
              this.userImgUrl = 'http://localhost:4941/api/v1/users/' + userId + `/image`
            }
          }, (error) => {
            this.error = error;
            this.errorFlag = true;
            this.userImgUrl = `https://static.thenounproject.com/png/770800-200.png`
          });
      console.log("url is ", this.userImgUrl)
      return this.userImgUrl
    },
    getEventCategories(Categories) {
      let returnString = ""
      for (let i = 0; i < Event.categories.length; i++) {
        if (i == Event.categories.length - 1) {
          returnString += Categories[Event.categories[i]]
        } else {
          returnString += Categories[Event.categories[i]] + "," + " "
        }
      }
      return returnString
    }
  }
}
</script>

<style>
.card {
  box-shadow: 0 10px 8px 0 rgba(0,0,0,0.2);
}

.column {
  float: left;
  width: 25%;
  padding: 0 10px;
}
</style>