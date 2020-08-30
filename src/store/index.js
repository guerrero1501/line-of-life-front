import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isAuthentication: false,
    accessToken: "",
    firstName: "",
    lastName: "",
    id: "",
    BASE_SERVER_URL: "https://line-of-life-dev.azurewebsites.net/api/",
    // BASE_SERVER_URL: "https://localhost:44328/api/",
    CONTROLLER_PIECE: "piece",
    CONTROLLER_SHAPE: "shape",
    CONTROLLER_STATES: "States",
    CONTROLLER_USER: "User",
    CONTROLLER_PHOTO: "Photo",
    SIGNUP: "Register",
    SIGNIN: "Login",
    ASSIGN_SHAPE: "AssignUserToShape",
    PHOTO_FILTER: "Filter",
  },
  mutations: {
    setAuth(state, isAuth, accessToken) {
      state.isAuthentication = isAuth;
      state.accessToken = accessToken;
    },
  },
  actions: {},
  modules: {},
  plugins: [createPersistedState()],
});
