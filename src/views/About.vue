<template>
  <div class="about">
    <h1 @click="setAuth(true)">This is an about page {{isAuthentication}}</h1>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
  computed: {
    ...mapState(["isAuthentication"])
  },
  methods: {
    ...mapMutations(["setAuth"])
  }
};
</script>