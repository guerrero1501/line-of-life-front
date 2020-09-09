<template>
  <div class="container">
    <loading :active.sync="loading"></loading>
    <div class="row" v-if="!file">
      <div v-if="url" class="col mt-3 mb-3">
        <img
          v-bind:src="url"
          class="img-fluid"
          style="max-width: 300px; max-height: 300px"
        />
      </div>
    </div>
    <div
      id="photo-preview"
      v-else
      :style="
        'height: ' +
          this.pHP +
          'px; width: ' +
          this.pWP +
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
      <div class="col">
        <button type="button" class="btn btn-primary" @click="ChooseShape">
          Random Shape
        </button>
      </div>
    </div>

    <div class="row" v-if="shapeId" id="camera-mode" style="display: none">
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
        <div class="custom-file" style="overflow: hidden">
          <input
            type="file"
            class="custom-file-input"
            id="validatedCustomFile"
            accept="image/*"
            @change="pickFileOrientation"
            required
          />
          <label v-if="!file" class="custom-file-label">Select a photo</label>
          <label v-else class="custom-file-label">{{ file.name }}</label>
        </div>
      </div>
      <div class="col-10" v-if="picked == 2">
        <WebCamera
          @deviceId="x => changeCamera(x)"
          @onCapture="img => capture(img)"
        />
      </div>
    </div>
    <div class="row mt-3" v-if="shapeId">
      <div class="col">
        <label id="label-x-offset" :class="mode">xoffset</label>
        <input
          id="input-x-offset"
          type="range"
          :class="'custom-range ' + mode"
          min="1"
          :max="maxXoffset"
          step="1"
          v-model="xoffset"
        />
      </div>
    </div>
    <div class="row mt-3" v-if="shapeId">
      <div class="col">
        <label id="label-y-offset" :class="mode">yoffset</label>
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
        <button type="button" class="btn btn-primary" @click="UploadPhoto">
          Filter Photo
        </button>
      </div>
    </div>
    <div class="row">
      <div v-if="cropped" class="col mt-3 mb-3">
        <img
          v-bind:src="cropped"
          class="img-fluid"
          style="max-width: 300px; max-height: 300px; display: block; margin: 0 auto"
        />
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
import loadImage from "blueimp-load-image";
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
      aspectRatioShape: 0,
      screenHeight: 0
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
          this.mode == "x-mode" ? this.pWP * 2 + this.pWS + 1 : this.pWP
        }px`,
        height: `${
          this.mode == "y-mode" ? 2 * this.pHP + this.pHS : this.pHP
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
        height: `${this.pHP}px`,
        width: `${this.pWP}px`,
        float: `${this.mode == "y-mode" ? "none" : "left"}`
      };
    },
    shapeStyle() {
      return {
        width: `${this.mode == "x-mode" ? "auto" : this.pWP + "px"}`,
        height: `${this.mode == "x-mode" ? this.pHP + "px" : "auto"}`,
        float: `${this.mode == "y-mode" ? "none" : "left"}`
      };
    }
  },
  methods: {
    CalculateOffset() {
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
    },
    dataURLtoFile(dataurl) {
      console.log(dataurl);
      // var block = dataurl.split(";");
      // Get the content type of the image
      // var contentType = block[0].split(":")[1];// In this case "image/gif"
      // get the real base64 content of the file
      // var realData = block[1].split(",")[1];

      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      this.file = new File([u8arr], "photo.jpg", { type: mime });
      console.log(this.file);
    },
    capture(img) {
      if (img) {
        //this.screenWidth
        this.previewImage = img.src;
        img.onload = () => {
          this.nHF = img.naturalHeight;
          this.nWF = img.naturalWidth;
          this.aspectRatioPhoto = this.nWF / this.nHF;
          var width = this.screenWidth - 20;
          var height = width / this.aspectRatioPhoto;
          if (height > 400) {
            height = 400;
            width = height * this.aspectRatioPhoto;
          }
          this.UP = this.nHF / width;
          console.log(this.UP);
          this.pWP = parseInt(width);
          this.pHP = parseInt(height);
          this.CalculateOffset();
          this.dataURLtoFile(this.previewImage);
        };
      }
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
            var width = this.screenWidth - 30;
            var height = width / this.aspectRatioPhoto;
            if (height > 400) {
              height = 400;
              width = height * this.aspectRatioPhoto;
            }
            this.UP = this.nHF / height;
            console.log(this.UP);
            this.pWP = parseInt(width);
            this.pHP = parseInt(height);
            this.CalculateOffset();
          };
        };
        reader.readAsDataURL(this.file);
      }
    },
    pickFileOrientation(event) {
      let files = event.target.files;
      if (files && files[0]) {
        this.file = files[0];
        loadImage(
          this.file,
          (img, data) => {
            console.log(img);
            console.log(data);
            this.previewImage = this.getDataUrl(img);
            this.nHF = data.originalHeight;
            this.nWF = data.originalWidth;
            this.aspectRatioPhoto = this.nWF / this.nHF;
            var width = this.screenWidth - 30;
            var height = width / this.aspectRatioPhoto;
            if (height > 400) {
              height = 400;
              width = height * this.aspectRatioPhoto;
            }
            this.UP = this.nHF / height;
            this.pWP = parseInt(width);
            this.pHP = parseInt(height);
            this.CalculateOffset();
          },
          { orientation: true } // Options
        );
      }
    },
    getDataUrl(img) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL("image/jpeg");
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
              this.xoffset = 0;
              this.yoffset = 0;
              this.nHS = image.naturalHeight;
              this.nWS = image.naturalWidth;
              this.aspectRatioShape = this.nWS / this.nHS;
              if (this.previewImage) {
                this.CalculateOffset();
              }
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
      console.log(this.file);
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
}
  ,
  mounted() {
    this.pieceId = this.$route.query.pieceId;
    this.loading = false;
    this.screenWidth = window.innerWidth;
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
#label-x-offset.y-mode,
#label-y-offset.x-mode {
  display: none;
}
#input-x-offset.y-mode,
#input-y-offset.x-mode {
  display: none;
}

#input-x-offset,
#input-y-offset {
  width: 70%;
  padding: 0 15%;
}
</style>
