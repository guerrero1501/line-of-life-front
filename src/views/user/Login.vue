<template>
  <div class="wrapper">
    <loading :active.sync="loading"></loading>
    <div class="form-signin">
      <h2 class="form-signin-heading">Please login</h2>
      <input type="text" class="form-control" placeholder="Email Address" v-model="userNameT" />
      <input type="password" class="form-control" placeholder="Password" v-model="password" />
      <label class="checkbox">
        <input type="checkbox" id="rememberMe" /> Remember me
      </label>
      <button class="btn btn-lg btn-primary btn-block" @click="submit">Login</button>
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
      userNameT: "",
      password: "",
      data: []
    };
  },
  computed: {
    ...mapState([
      "isAuthentication",
      "BASE_SERVER_URL",
      "CONTROLLER_USER",
      "SIGNUP",
      "SIGNIN",
      "accessToken",
      "userName",
      "lastName",
      "id"
    ])
  },
  methods: {
    ...mapMutations(["setAuth"]),
    submit() {
      this.loading = true;

      if (!this.userNameT || !this.password) {
        alert("userName/password required.");
        return;
      }
      let body = {
        userName: this.userNameT,
        password: this.password
      };
      console.log("antes de ");
      axios
        .post(
          `${this.BASE_SERVER_URL}${this.CONTROLLER_USER}/${this.SIGNIN}`,
          body
        )
        .then(response => {
          alert("whatsapp");

          console.log(json);
          let json = response.data;
          this.loading = false;
          if (response.status === 200) {
            this.accessToken = json.authToken;
            this.id = json.id;
            this.userName = json.userName;
            this.lastName = json.lastName;
            this.setAuth(true);

            localStorage.setItem("id", this.id);
            localStorage.accessToken = this.accessToken;
            localStorage.setItem("userName", this.userName);
            localStorage.setItem("lastName", this.lastName);

            this.$router.push("/");
          } else alert(json.header.message);
        })
        .catch(error => {
          this.loading = false;
          alert("error: " + error);
        });
    }
  },
  async mounted() {
    this.loading = true;
    this.loading = false;
  },
  components: {
    Loading
  }
};
</script>

<style scoped>
body {
  background: #eee !important;
}

.wrapper {
  margin-top: 80px;
  margin-bottom: 80px;
}

.form-signin {
  max-width: 380px;
  padding: 15px 35px 45px;
  margin: 0 auto;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>