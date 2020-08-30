<template>
  <div>
    <div class="container mt-5">
      <loading :active.sync="loading"></loading>
      <div class="row">
        <div v-if="url" class="col mt-3 mb-3">
          <img
            v-bind:src="url"
            class="img-fluid"
            style="max-width: 500px; max-height: 500"
          />
        </div>
      </div>
      <div class="row">
        <div class="custom-file">
          <input
            type="file"
            class="custom-file-input"
            id="validatedCustomFile"
            @change="setFile"
            required
          />
          <label v-if="!file" class="custom-file-label">Choose piece...</label>
          <label v-else class="custom-file-label">{{ file.name }}</label>
        </div>
      </div>
      <div class="row">
        <div class="col mt-3">
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

// import axios from "axios";
export default {
  data() {
    return {
      loading: true,
      file: null,
      url: "",
    };
  },
  computed: {
    ...mapState(["isAuthentication", "BASE_SERVER_URL", "CONTROLLER_PIECE"]),
  },
  methods: {
    ...mapMutations(["setAuth"]),
    setFile(event) {
      this.file = event.target.files[0];
    },
    async submit() {
      this.loading = true;
      if (!this.file) {
        this.loading = false;
        alert("Piece required");
        return;
      }
      const formData = new FormData();
      formData.append("file", this.file);

      const response = await fetch(
        `${this.BASE_SERVER_URL}${this.CONTROLLER_PIECE}`,
        {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          body: formData, // body data type must match "Content-Type" header
        }
      );
      let json = await response.json();
      console.log(json);

      this.loading = false;

      if (json.header.code === 200) {
        alert("The Piece has been processed correctly");
        this.url = json.data;
      } else alert(json.header.message);

      return json;
    },
  },
  mounted() {
    this.loading = false;
  },
  components: {
    Loading,
  },
};
</script>
