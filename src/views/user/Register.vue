<template>
  <div>
    <loading :active.sync="loading"></loading>
    <div class="container">
      <div class="row">
        <div class="col-md-6" style="padding: 15px">
          <label>First Name</label>
          <input type="text" class="form-control" v-model="firstName" />
        </div>
        <div class="col-md-6" style="padding: 15px">
          <label>Middle Name</label>
          <input type="text" class="form-control" v-model="middleName" />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6" style="padding: 15px">
          <label>Last Name</label>
          <input type="text" class="form-control" v-model="lastName" />
        </div>
        <div class="col-md-6" style="padding: 15px">
          <label>Phone Number</label>
          <input type="tel" class="form-control" v-model="phoneNumber" />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6" style="padding: 15px">
          <label>Address</label>
          <input type="text" class="form-control" v-model="address" />
        </div>
        <div class="col-md-6" style="padding: 15px">
          <label>State</label>
          <select id="type" class="form-control" v-model="stateId">
            <option>Choose...</option>
            <option
              v-for="state in states"
              :key="state.id"
              :value="state.id"
            >{{state.abbreviation}} - {{state.name}}</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6" style="padding: 15px">
          <label>City</label>
          <input type="text" class="form-control" v-model="city" />
        </div>
        <div class="col-md-6" style="padding: 15px">
          <label>Zip Code</label>
          <input type="text" class="form-control" v-model="zip" />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6" style="padding: 15px">
          <label>Email</label>
          <input type="text" class="form-control" v-model="email" />
        </div>
        <div class="col-md-6" style="padding: 15px">
          <label>Birthdate</label>
          <input type="date" class="form-control" v-model="birthdate" />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6" style="padding: 15px">
          <label>Password</label>
          <input type="password" class="form-control" v-model="password" />
        </div>
        <div class="col-md-6" style="padding: 15px">
          <label>Password Confirmation</label>
          <input type="password" class="form-control" v-model="passwordConfirmation" />
        </div>
      </div>
      <div class="row">
        <div class="col mt-3" style="padding: 15px">
          <button class="btn btn-primary" @click="submit">Process</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

// Import component
import Loading from "vue-loading-overlay";
// Import stylesheet
import "vue-loading-overlay/dist/vue-loading.css";
import axios from "axios";
export default {
  data() {
    return {
      loading: true,
      states: [],
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      city: "",
      zip: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      stateId: "",
      birthdate: new Date().toISOString()
    };
  },
  computed: {
    ...mapState([
      "isAuthentication",
      "BASE_SERVER_URL",
      "CONTROLLER_STATES",
      "CONTROLLER_USER",
      "SIGNUP"
    ])
  },
  methods: {
    ...mapMutations(["setAuth"]),
    setFile(event) {
      this.file = event.target.files[0];
    },
    async submit() {
      this.loading = true;

      if (this.password && this.password != this.passwordConfirmation) {
        alert("passwords do not match.");
        return;
      }

      console.log(this.birthdate);
      let body = {
        firstName: this.firstName,
        middleName: this.middleName,
        lastName: this.lastName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        address: this.address,
        city: this.city,
        stateId: this.stateId,
        zipCode: this.zip,
        birthdate: this.birthdate,
        userName: this.email,
        password: this.password
      };

      axios
        .post(
          `${this.BASE_SERVER_URL}${this.CONTROLLER_USER}/${this.SIGNUP}`,
          body
        )
        .then(response => {
          this.loading = false;
          if (response.status === 200) {
            alert("Done.");
            this.$router.push("/signin");
          } else alert(response.message);
        })
        .catch(error => {
          this.loading = false;
          alert("error: " + error);
        });
    }
  },
  async mounted() {
    this.loading = true;
    const response = await fetch(
      `${this.BASE_SERVER_URL}${this.CONTROLLER_STATES}`
    );
    let json = await response.json();

    if (json.header.code === 200) {
      this.states = json.data;
    } else alert(json.header.message);

    this.loading = false;
  },
  components: {
    Loading
  }
};
</script>

<style scoped>
</style>