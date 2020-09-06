<template>
  <div class="container">
    <div class="row">
      <div class="col-md-6">
        <h2>Current Camera</h2>
        <code v-if="device">{{ device.label }}</code>
        <div class="border">
          <vue-web-cam
            ref="webcam"
            :device-id="deviceId"
            :resolution="{width: fourKConstraints.video.width.exact, height: fourKConstraints.video.height.exact}"            
            @started="onStarted"
            @stopped="onStopped"
            @error="onError"
            @cameras="onCameras"
            @camera-change="onCameraChange"
          />
        </div>

        <div class="row">
          <div class="col-md-12">
            <select v-model="camera">
              <option>-- Select Device --</option>
              <option
                v-for="device in devices"
                :key="device.deviceId"
                :value="device.deviceId"
              >{{ device.label }}</option>
            </select>
          </div>
          <div class="col-md-12">
            <button type="button" class="btn btn-primary" @click="onCapture">Capture Photo</button>
            <button type="button" class="btn btn-danger" @click="onStop">Stop Camera</button>
            <button type="button" class="btn btn-success" @click="onStart">Start Camera</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { WebCam } from "vue-web-cam";
export default {
  name: "App",
  components: {
    "vue-web-cam": WebCam
  },
  props: {
    image: Image
  },
  data() {
    return {
      img: null,
      camera: null,
      deviceId: null,
      devices: [],      
      qvgaConstraints: {  video: {width: {exact: 320}, height: {exact: 240}}},
      vgaConstraints: {  video: {width: {exact: 640}, height: {exact: 480}}},
      hdConstraints: {  video: {width: {exact: 1280}, height: {exact: 720}}},
      fullHdConstraints: {  video: {width: {exact: 1920}, height: {exact: 1080}}},
      fourKConstraints: {  video: {width: {exact: 4096}, height: {exact: 2160}}},
      eightKConstraints: {  video: {width: {exact: 7680}, height: {exact: 4320}}},
    };
  },
  computed: {
    device: function() {
      return this.devices.find(n => n.deviceId === this.deviceId);
    }
  },
  watch: {
    camera: function(id) {

      this.deviceId = id;
    },
    devices: function() {
      // Once we have a list select the first one
      const [first] = this.devices;
      if (first) {
        this.camera = first.deviceId;
        this.deviceId = first.deviceId;
      }
    }
  },
  methods: {
    onCapture() {
      this.img = this.$refs.webcam.capture();
      var imgT = new Image();
      imgT.src = this.img;
      this.image = imgT;
      this.$emit('onCapture', imgT)
    },
    onStarted(stream) {
      console.log("On Started Event", stream);
    },
    onStopped(stream) {
      console.log("On Stopped Event", stream);
    },
    onStop() {
      this.$refs.webcam.stop();
    },
    onStart() {
      this.$refs.webcam.start();
    },
    onError(error) {
      console.log("On Error Event", error);
    },
    onCameras(cameras) {
      this.devices = cameras;
      console.log("On Cameras Event", cameras);
    },
    onCameraChange(deviceId) {
      this.deviceId = deviceId;
      this.camera = deviceId;
      this.$emit('deviceId', this.deviceId)
      console.log("On Camera Change Event", deviceId);
    }
  }
};
</script>