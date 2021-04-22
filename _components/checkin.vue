<template>
  <div id="checkinggComponent">
    <!--Map-->
    <div id="mapChecking" ref="mapChecking" v-if="location.hasPermission"></div>

    <!--Message map unavailable-->
    <div v-else style="height: 200px; padding: 22px 0" class="bg-grey-4 text-center">
      <div class="q-px-md">
        <q-icon color="grey-6" name="fas fa-map-marked-alt" size="80px"/>
        <div class="q-mt-md">
          <q-icon name="fas fa-exclamation-triangle" color="warning"/>
          Permission to obtain the location was denied ... please allow it
        </div>
      </div>
    </div>

    <!--Content-->
    <div id="chronometerContent">
      <!--Button actions chronometer-->
      <div class="text-center">
        <!--Button start chronometer-->
        <q-btn @click="getActiveShift" round color="secondary" size="28px" v-if="!activeShift">
          <q-icon id="iconButton" name="fas fa-play" size="25px" class="q-pa-xs q-mb-xs full-width"/>
          <label style="font-size: 12px">Start</label>
        </q-btn>
        <!--End shift-->
        <q-btn color="negative" class="q-mx-xs" size="28px" round :loading="loading" v-else @click="endShift">
          <q-icon id="iconButton" name="fas fa-stop" size="25px" class="q-pa-xs q-mb-xs full-width"/>
          <label style="font-size: 12px">Stop</label>
        </q-btn>
      </div>

      <!--Shift Information-->
      <div v-if="startChronometer">
        <div id="timer" class="q-box bg-primary text-center text-white">
          <!--Date-->
          <div class="q-body-1">
            {{ activeShift.checkinAt ? $trd(activeShift.checkinAt, {type: "long"}) : "" }}
          </div>
          <!--chronometer-->
          <div id="screen" class="q-display-2 q-mb-sm">
            {{ time.text }}
          </div>
          <!--Line separator-->
          <q-separator size="1px" color="white" class="q-my-xs"/>
          <!--Address-->
          <div class="q-caption">
            <q-icon name="fas fa-map-marker-alt"/>
            {{ location.address || 'No location available' }}
          </div>
        </div>
      </div>

      <!--Comment-->
      <div class="q-pa-md">
        <dynamic-field v-model="comment.text" :field="fields.comments"></dynamic-field>
      </div>

      <!--Actions-->
      <div class="text-center">
        <!--My shifts-->
        <q-btn unelevated label="My Shifts" color="primary" class="" size="sm" rounded icon="fas fa-user-clock"/>
        <!--Add custom shift-->
        <q-btn v-if="false" label="Add Shift" color="positive" class="q-mx-xs" size="sm" rounded icon="fas fa-plus"/>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  props: {},
  components: {},
  watch: {},
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  beforeRouteLeave(to, from, next) {
    if (this.control) clearInterval(this.control);
    next()
  },
  data() {
    return {
      loading: false,
      location: {
        pos: null,
        address: 'No location available',
        hasPermission: false,
      },
      ActiveShift: false,
      time: {
        text: "00:00:00",
        hh: 0,
        mm: 0,
        ss: 0
      },
      activeShift: false,
      control: false,
      comment: {
        loading: false,
        text: null
      }
    }
  },
  computed: {
    fields() {
      return {
        comments: {
          value: '',
          type: 'input',
          props: {
            label: `${this.$tr('ui.form.comment')}`,
            type: 'textarea',
            rows: "3",
            icon: "fas fa-comment-dots"
          },
        },
      }
    }
  },
  methods: {
    //Init
    async init() {
      // console.warn(config("apiRoutes.qcheckin.shifts"))
      // await this.$helper.getCurrentPosition()
      // this.requestCurrentLocation()
      await this.getActiveShift()
      // await this.startChronometer()
    },
    //Get current position
    // requestCurrentLocation() {
    //   return new Promise((resolve, reject) => {
    //     if (navigator.geolocation)
    //       navigator.geolocation.getCurrentPosition(
    //         (pos) => {
    //           //Save current latitude and longitude
    //           this.location.hasPermission = true
    //           this.location.pos = {
    //             lat: pos.coords.latitude,
    //             lng: pos.coords.longitude
    //           }
    //
    //           //Search address
    //           let geocoder = new google.maps.Geocoder()
    //           let location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
    //           geocoder.geocode({'location': location},
    //             (results, status) => {
    //               if (status == 'OK') this.location.address = results[0].formatted_address
    //             }
    //           )
    //
    //           //Load Map
    //           this.loadMap()
    //           resolve(pos)
    //         },
    //         () => {//Failed response
    //           this.location = {pos: false, address: 'No location available', hasPermission: false}
    //           resolve(false)
    //         },
    //         {timeout: 60000}
    //       );
    //   })
    // },
    // //Get active shift
    getActiveShift() {
      return new Promise((resolve, reject) => {
        this.loading = true
        //Request params
        let requestParams = {params: {filter: {noCheckout: true, field: "checkin_by"}}}
        let userId = this.$store.state.quserAuth.userId
        //Request
        this.$crud.show("apiRoutes.qcheckin.shifts", userId, requestParams).then(response => {
          console.warn("----test" , typeof response.data, response.data)

          if (typeof response.data == "object") {
            console.warn("---------")
            this.activeShift = this.$clone(response.data)
            this.comment.text = response.data.options.comment || null
          }

          console.warn(this.activeShift)
          this.loading = false

          resolve(response.data)
        }).catch(error => () => {
          console.error(error)
          this.loading = false
          reject(console.warn("----error"), error)
        })
      })
    },
    //Start chronometer
    startChronometer() {
      this.loading = true
      if (this.activeShift) {
        console.warn("<<<<<<<<<<<<startChronometer>>>>>>>>>>>>",)

        this.time.ss = this.activeShift.diff.s
        this.time.mm = this.activeShift.diff.i
        this.time.hh = this.activeShift.diff.h

        this.time.text = (this.time.hh == 0 ? '00' : this.time.hh < 10 ? '0' + this.time.hh : this.time.hh)
          + ":" +
          (this.time.mm == 0 ? '00' : this.time.mm < 10 ? '0' + this.time.mm : this.time.mm)
          + ":" +
          (this.time.ss == 0 ? '00' : this.time.ss < 10 ? '0' + this.time.ss : this.time.ss)
        this.control = setInterval(this.timer, 1000);

        //Emit start chronometer
        this.$emit('checking')
      }
    },
    //Interval Timer
    timer() {
      let ss, mm, hh
      this.activeShift.diff.s++;

      if (this.activeShift.diff.s == 60) {
        this.activeShift.diff.s = 0
        this.activeShift.diff.i++;

      }
      if (this.activeShift.diff.i == 60) {
        this.activeShift.diff.i = 0
        this.activeShift.diff.h++
      }

      ss = this.$clone(this.activeShift.diff.s)
      mm = this.$clone(this.activeShift.diff.i)
      hh = this.$clone(this.activeShift.diff.h)

      if (this.activeShift.diff.s < 10) {
        ss = "0" + ss;
      }
      if (mm < 10) {
        mm = "0" + mm;
      }
      if (hh < 10) {
        hh = "0" + hh;
      }

      this.time.text = hh + ":" + mm + ":" + ss
    },
    //Initialize map
    loadMap() {
      setTimeout(() => {
        //Map options
        let mapOptions = {
          zoom: 14,
          center: this.location.pos,
          mapTypeControl: false,
          streetViewControl: false,
        }

        //Init Map
        let mapObject = new google.maps.Map(document.getElementById('mapChecking'), mapOptions);
        //Set market
        let mapMarker = new google.maps.Marker({map: mapObject, position: this.location.pos});
      }, 500)
    },
    //Create new shift
    createShift() {
      this.loading = true
      //Request data
      let requestData = {
        geoLocation: {checking: this.location.pos},
        options: {address: {checking: this.location.address}}
      }
      //Request
      this.$crud.create('api.checking.checking', requestData).then(response => {
        this.activeShift = response.data
        this.sendComment() //Send comment
        this.startChronometer()
        this.loading = false
      }).catch(error => this.loading = false)
    },
    //End shift
    endShift() {
      this.activeShift = false
      this.sendComment() //Send comment
      return clearInterval(this.control);
      //Request Params
      let requestParams = {params: {filter: {checkout: true}}}
      //Request Data
      let requestData = this.activeShift
      //Set checkout geoLocation
      requestData.geoLocation = {...requestData.geoLocation, checkout: this.location.pos}
      //Set checkout address
      requestData.options.address = {...requestData.options.address, checkout: this.location.address}
      //Request
      this.$crud.update('api.checking.checkout', requestData.id, requestData, requestParams).then(response => {
        this.activeShift = false
        clearInterval(this.control);
        this.$emit('checkout')
        this.comment.text = null
        this.loading = false
      }).catch(error => this.loading = false)
    },
    //Send comment
    sendComment() {
      if (this.activeShift) {
        this.loading = true
        //Request data
        let requestData = {
          options: {...this.activeShift.options, comment: this.comment.text || 'No comments'}
        }
        //Request
        this.$crud.update('api.checking.shifts', this.activeShift.id, requestData).then(response => {
          this.loading = false
        }).catch(error => this.loading = false)
      }
    }
  }
}
</script>
<style lang="stylus">
#checkinggComponent
  #chronometerContent
    background-color $grey-2
    position relative

    &:before
      content ''
      background-color $grey-2
      width: 115px;
      height: 115px;
      position absolute
      top -15px
      left 0
      right 0
      margin auto
      border-radius 50%

    #iconButton
      top 15px

    #timer
      font-size 15px
      padding 20px

      #screen
        font-size 33px

    #mapChecking
      height 250px
      width 100%
      border none

</style>
