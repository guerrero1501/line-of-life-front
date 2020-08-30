<template>
  <div>
    <loading :active.sync="loading"></loading>
    <div class="container mt-5" style="text-align: left">
      <div
        v-for="piece in data"
        :key="piece.id"
        class="card"
        style="width: 18rem; display: inline-block; margin: 5px"
      >
        <img
          class="card-img-top"
          :src="
              'https://shapedeploylineoflife.blob.core.windows.net/pieces/' +
                piece.original
            "
          alt="Card image cap"
        />
        <div class="card-body">
          <h5 class="card-title">{{ piece.name }}</h5>
          <p class="card-text">{{ piece.description }}</p>
          <p class="card-text">{{ piece.id }}</p>
          <router-link :to="{ path: 'AssignShape', query: { pieceId: piece.id } }">Choose Shape</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/vue-loading.css";
export default {
  data() {
    return {
      loading: true,
      data: []
    };
  },
  computed: {
    ...mapState(["isAuthentication", "BASE_SERVER_URL", "CONTROLLER_PIECE"])
  },
  methods: {
    ...mapMutations(["setAuth"]),
    async retrievePieces() {
      const response = await fetch(
        `${this.BASE_SERVER_URL}${this.CONTROLLER_PIECE}`
      );
      let json = await response.json();

      if (json.header.code === 200) {
        this.data = json.data;
        this.loading = false;
      } else {
        alert(json.header.message);
        this.loading = false;
      }

      console.log(json);
    }
  },
  mounted() {
    this.retrievePieces();
  },
  components: {
    Loading
  }
};
</script>
