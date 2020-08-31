<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>&nbsp;|
      <router-link to="/Signup">Sign Up</router-link>&nbsp;|
      <router-link v-if="!isAuthentication" to="/signin">login</router-link>
      <router-link v-else to="/logout">logout</router-link>&nbsp;|
      <router-link to="/processpiece">Process Piece</router-link>&nbsp;|
      <router-link to="/choosepiece">Choose Piece</router-link>&nbsp;|
      <router-link to="/rebuildpiece">Rebuild Piece</router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";

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
    ...mapMutations(["setAuth"])
  },
  async mounted() {
    this.loading = true;
    this.loading = false;
  },
  watch: {
    accessToken(accessToken) {
      localStorage.accessToken = accessToken;
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
