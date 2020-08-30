<template>
  <div>
    <div class="container mt-5">
      <loading :active.sync="loading"></loading>
      <span>PieceId: {{ pieceId }}</span>
      <span>Selected: {{ type }}</span>
      <div class="row">
        <div class="col mt-3 mb-3">
          <img v-bind:src="url" class="img-fluid" style="max-width: 200px; max-height: 200" />
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <label>Type</label>
          <select id="type" class="form-control" v-model="type">
            <option value="0">Solid</option>
            <option value="1">Image</option>
          </select>
        </div>
      </div>
      <div class="row" v-if="type == 0">
        <div class="col-md-6">
          <div class="row">
            <div class="col-md-6">
              <label>R ({{R}})</label>
              <input type="range" class="custom-range" min="0" max="255" step="1" v-model="R" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <label>G ({{G}})</label>
              <input type="range" class="custom-range" min="0" max="255" step="1" v-model="G" />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6">
              <label>B ({{B}})</label>
              <input type="range" class="custom-range" min="0" max="255" step="1" v-model="B" />
            </div>
          </div>
          <div class="row" v-if="false">
            <div class="col-md-6">
              <label>A ({{A}}%)</label>
              <input type="range" class="custom-range" min="0" max="100" step="1" v-model="A" />
            </div>
          </div>
        </div>
        <div
          class="col-md-6"
          :style="'background-color:rgba(' + R +',' + G +',' + B +',' + A / 100 +')'"
        ></div>
      </div>
      <div class="row" v-if="type == 1">
        <div class="col-md-6">
          <label>Background-Photo</label>
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
      </div>
      <div class="row" v-if="false">
        <div class="col-md-6">
          <label>Scale Factor ({{scaleFactor}})</label>
          <input type="range" class="custom-range" min="1" max="10" step="1" v-model="scaleFactor" />
        </div>
      </div>
      <div class="row">
        <div class="col mt-3">
          <button class="btn btn-primary" @click="submit">Submit</button>
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
      file: null,
      type: 0,
      url: "",
      color: "",
      scaleFactor: 1,
      R: 0,
      G: 0,
      B: 0,
      A: 100,
      pieceId: "",
      alfa: 0
    };
  },
  computed: {
    ...mapState(["isAuthentication", "BASE_SERVER_URL", "CONTROLLER_PIECE"])
  },
  methods: {
    ...mapMutations(["setAuth"]),
    setFile(event) {
      this.file = event.target.files[0];
    },
    async submit() {
      this.loading = true;

      let formData = new FormData();

      switch (this.type) {
        case 0:
        case "0":
          this.alfa = parseInt((255 * this.A) / 100);
          this.color = `(${this.R}, ${this.G}, ${this.B}, ${this.alfa})`;
          formData.append("color", this.color);
          break;
        case 1:
        case "1":
          if (!this.file) {
            this.loading = false;
            alert("Background image is required");
            return;
          }
          formData.append("backgroundImage", this.file);
          break;
        default:
          alert("Invalid Type.");
          return;
      }
      formData.append("type", this.type);
      formData.append("scaleFactor", this.scaleFactor);
      formData.append("pieceId", this.pieceId);
      const response = await fetch(
        `${this.BASE_SERVER_URL}${this.CONTROLLER_PIECE}/Rebuild`,
        {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          body: formData // body data type must match "Content-Type" header
        }
      );
      let json = await response.json();
      console.log(json);

      this.loading = false;

      if (json.header.code === 200) {
        axios({
          url: json.data,
          method: "GET",
          responseType: "blob"
        })
          .then(resp => {
            var fileURL = window.URL.createObjectURL(new Blob([resp.data]));
            var fileLink = document.createElement("a");

            let arraySegment = json.data.split("/");
            fileLink.href = fileURL;
            fileLink.target = "_blank";
            fileLink.setAttribute(
              "download",
              arraySegment[arraySegment.length - 1]
            );
            document.body.appendChild(fileLink);

            fileLink.click();
          })
          .catch(error => {
            this.loading = false;
            alert("error: " + error);
          });
      } else alert(json.header.message);

      return json;
    }
  },
  mounted() {
    this.loading = false;
    this.pieceId = this.$route.query.pieceId;
    this.url =
      "https://shapedeploylineoflife.blob.core.windows.net/pieces/" +
      this.$route.query.url;
  },
  components: {
    Loading
  }
};
</script>