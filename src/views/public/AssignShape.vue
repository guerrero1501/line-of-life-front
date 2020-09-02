<template>
  <div class="container">
    <loading :active.sync="loading"></loading>
    <div class="row" v-if="!file">
      <div v-if="url" class="col mt-3 mb-3">
        <img v-bind:src="url" class="img-fluid" style="max-width: 300px; max-height: 300px" />
      </div>
    </div>
    <div
      id="photo-preview"
      v-else
      :style="
        'width: ' +
          this.aspectRatioPhoto * 400 +
          'px ; background-image:url(' +
          previewImage +
          ')'
      "
    >
      <div id="shape-wrap" :style="shapeWrap">
        <div class="white-space" :style="whiteSpace"></div>
        <!-- display:block -->
        <img id="shape" :src="negative" :style="shapeStyle" />
        <div class="white-space" :style="whiteSpace"></div>
        <!-- display:block -->
      </div>
    </div>
    <div class="row">
      <div v-if="cropped" class="col mt-3 mb-3">
        <img v-bind:src="cropped" class="img-fluid" style="max-width: 300px; max-height: 300px" />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <button type="button" class="btn btn-primary" @click="ChooseShape">Good Luck</button>
      </div>
    </div>

    <div class="row" v-if="shapeId">
      <div class="col">
        <input type="radio" id="1" value="1" v-model="picked" />
        <label>Take image of the gallery</label>
        <br />
      </div>
      <div class="col">
        <input type="radio" id="2" value="2" v-model="picked" />
        <label>Take photo on the camera</label>
        <br />
      </div>
    </div>

    <div class="row mt-3" v-if="shapeId">
      <div class="col-10" v-if="picked == 1">
        <div class="custom-file">
          <input
            type="file"
            class="custom-file-input"
            id="validatedCustomFile"
            accept="image/*"
            @change="pickFile"
            required
          />
          <label v-if="!file" class="custom-file-label">Choose piece...</label>
          <label v-else class="custom-file-label">{{ file.name }}</label>
        </div>
      </div>
      <div class="col-10" v-if="picked == 2">
        <WebCamera @deviceId="x => changeCamera(x)" @onCapture="img => setImage(img)"/>
      </div>
    </div>
    <div class="row mt-3" v-if="shapeId">
      <div class="col">
        <label>xoffset</label>
        <input
          id="input-x-offset"
          type="range"
          :class="'custom-range ' + mode"
          min="1"
          :max="maxXoffset"
          step="1"
          v-model="xoffset"
          @change="changeX"
        />
      </div>
    </div>
    <div class="row mt-3" v-if="shapeId">
      <div class="col">
        <label>yoffset</label>
        <input
          id="input-y-offset"
          type="range"
          :class="'custom-range ' + mode"
          min="1"
          :max="maxYoffset"
          step="1"
          v-model="yoffset"
        />
      </div>
    </div>
    <div class="row mt-3" v-if="shapeId">
      <div class="col">
        <button type="button" class="btn btn-primary" @click="UploadPhoto">Filter Photo</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
import axios from "axios";
import WebCamera from "../../components/WebCamera";
export default {
  data() {
    return {
      image: new Image(),
      deviceId: "",
      loading: true,
      picked: 1,
      mode: "",
      pieceId: "",
      shapeId: "",
      url: "",
      negative: "",
      original: "",
      cropped: "",
      files: null,
      file: null,
      xoffset: 0,
      yoffset: 0,
      maxYoffset: 1000,
      maxXoffset: 1000,
      previewImage: null,
      nHF: 0,
      nWF: 0,
      nHC: 0,
      nWC: 0,
      nHS: 0,
      nWS: 0,
      pWS: 0,
      pHS: 0,
      pWP: 0,
      pHP: 0,
      UP: 0,
      aspectRatioPhoto: 0,
      aspectRatioShape: 0
    };
  },
  components: {
    Loading,
    WebCamera
  },
  computed: {
    ...mapState([
      "isAuthentication",
      "BASE_SERVER_URL",
      "CONTROLLER_SHAPE",
      "CONTROLLER_PHOTO",
      "ASSIGN_SHAPE",
      "PHOTO_FILTER"
    ]),
    shapeWrap() {
      return {
        width: `${
          this.mode == "x-mode"
            ? 400 * (this.aspectRatioPhoto * 2 + this.aspectRatioShape) + 1
            : this.aspectRatioPhoto * 400
        }px`,
        height: `${
          this.mode == "y-mode"
            ? 800 + (400 * this.aspectRatioPhoto) / this.aspectRatioShape + 1
            : 400
        }px`,
        top: `${
          this.mode == "y-mode"
            ? -1 * parseInt(this.pHP) + parseInt(this.yoffset)
            : 0
        }px`,
        left: `${
          this.mode == "x-mode"
            ? -1 * parseInt(this.pWP) + parseInt(this.xoffset)
            : 0
        }px`
      };
    },
    whiteSpace() {
      return {
        height: `${400}px`,
        width: `${this.aspectRatioPhoto * 400}px`,
        float: `${this.mode == "y-mode" ? "none" : "left"}`
      };
    },
    shapeStyle() {
      return {
        width: `${
          this.mode == "x-mode" ? "auto" : 400 * this.aspectRatioPhoto + "px"
        }`,
        height: `${this.mode == "x-mode" ? 400 + "px" : "auto"}`,
        float: `${this.mode == "y-mode" ? "none" : "left"}`
      };
    }
  },
  methods: {
    changeX() {
      console.log(this.xoffset);
      console.log(this.mode == "x-mode");
      console.log(this.pWP);
      console.log(this.xoffset);
      console.log(parseInt(this.pWP) + parseInt(this.xoffset));
    },
    setImage(img){
      this.image = img;
      console.log(this.image);
    }
    ,
    async changeCamera(deviceId){
      this.deviceId = deviceId;
      let tracks = (await navigator.mediaDevices.getUserMedia({video: true})).getTracks(); //[0].getSettings()
      tracks.forEach(element => {
        
        if(this.deviceId == element.getSettings().deviceId){
          let {width, height} = element.getSettings();
          this.nHC = height;
          this.nWC = width;
          console.log(element.getSettings());
        }
      });
     
      console.log(this.nHC);
      console.log(this.nWC);
      alert(this.nHC + "x" + this.nWC)
    },
    pickFile(event) {
      let files = event.target.files;
      if (files && files[0]) {
        this.file = files[0];
        let reader = new FileReader();
        reader.onload = e => {
          console.log(e.target);
          var image = new Image();
          image.src = e.target.result;

          this.previewImage = e.target.result;

          image.onload = () => {
            this.nHF = image.naturalHeight;
            this.nWF = image.naturalWidth;

            this.aspectRatioPhoto = this.nWF / this.nHF;
            this.UP = this.nHF / 400;
            console.log(this.UP);
            this.pWP = parseInt(this.nWF / this.UP);
            this.pHP = parseInt(this.nHF / this.UP);
            if (this.aspectRatioPhoto >= this.aspectRatioShape) {
              this.mode = "x-mode";
              this.yoffset = 0;
              this.pHS = this.pHP;
              this.pWS = this.pHS * this.aspectRatioShape;
              this.maxXoffset = parseInt(this.pWP - this.pWS);
              this.maxYoffset = 0;
            } else {
              this.mode = "y-mode";
              this.xoffset = 0;
              this.pHS = this.pWP / this.aspectRatioShape;
              this.pWS = this.pWP;
              this.maxYoffset = parseInt(this.pHP - this.pHS);
              this.maxXoffset = 0;
            }
            
          };
        };
        reader.readAsDataURL(this.file);
      }
    },
    ChooseShape() {
      this.loading = true;
      let body = { pieceId: this.pieceId, userId: "202008252542_DVG" };
      axios
        .post(
          `${this.BASE_SERVER_URL}${this.CONTROLLER_SHAPE}/${this.ASSIGN_SHAPE}`,
          body
        )
        .then(response => {
          console.log(json);
          let json = response.data;
          this.loading = false;
          if (response.status === 200) {
            this.shapeId = json.data.id;
            this.url =
              "https://shapedeploylineoflife.blob.core.windows.net/shapes/" +
              json.data.original;
            this.negative = this.url.replace("positive", "negative");
            this.original = this.url;
            var image = new Image();
            image.src = this.url;

            image.onload = () => {
              this.nHS = image.naturalHeight;
              this.nWS = image.naturalWidth;
              this.aspectRatioShape = this.nWS / this.nHS;
            };
          } else alert(json.header.message);
        })
        .catch(error => {
          this.loading = false;
          alert("error: " + error);
        });
    },
    UploadPhoto() {
      this.loading = true;

      if (!this.file) {
        this.loading = false;
        alert("Photo required");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.file);
      formData.append("shapeId", this.shapeId);
      axios
        .post(`${this.BASE_SERVER_URL}${this.CONTROLLER_PHOTO}`, formData)
        .then(response => {
          console.log(json);
          let json = response.data;
          if (response.status === 200) {
            let body = {
              id: this.shapeId + "_202008252542_DVG",
              shapeId: this.shapeId,
              xoffset: parseInt(parseInt(this.xoffset) * this.UP),
              yoffset: parseInt(parseInt(this.yoffset) * this.UP)
            };
            axios
              .post(
                `${this.BASE_SERVER_URL}${this.CONTROLLER_PHOTO}/${this.PHOTO_FILTER}`,
                body
              )
              .then(response1 => {
                let json1 = response1.data;
                this.loading = false;
                if (response1.status === 200) {
                  this.cropped = json1.cropped;
                } else alert(json.header.message);
              })
              .catch(error => {
                this.loading = false;
                alert("error: " + error);
              });
          } else alert(json.header.message);
        })
        .catch(error => {
          this.loading = false;
          alert("error: " + error);
        });
    },
    setFile(event) {
      this.file = event.target.files[0];
      console.log(this.file);
    }
  },
  mounted() {
    this.pieceId = this.$route.query.pieceId;
    this.loading = false;
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
#photo-preview-before {
  display: none;
}
#photo-preview {
  position: relative;
  overflow: hidden;
  height: 400px;
  margin: 0 auto;
  border: solid 1px red;
  background-size: cover;
  background-position: center;
}
#shape-wrap {
  position: absolute;
  opacity: 0.8;
}
.white-space {
  background-color: #fff;
}
#shape {
  display: block;
}
#input-x-offset.x-mode,
#input-y-offset.y-mode {
}
#input-x-offset.y-mode,
#input-y-offset.x-mode {
  display: none;
}
</style>
