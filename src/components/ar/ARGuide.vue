<template>
  <q-dialog
    id="ar-guide"
    class="no-pointer-events non-selectable"
    seamless
    no-backdrop-dismiss
    no-esc-dismiss
    transition-show="fade"
    transition-hide="fade"
    v-model="isOpen"
  >
    <q-card
      class="no-pointer-events non-selectable rounded-borders q-pa-sm q-py-md text-white text-center text-weight-bold"
      style="width: 250px"
    >
      {{ currentStatus }}
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    status: String,
  },
  data() {
    return {
      isOpen: false,
      statusMessages: {
        hidden: "",
        findSurface: "Bewegen Sie Ihr Smartphone, um eine Fläche zu finden",
        placeInitial:
          "Klicken Sie auf den Bildschirm, um das Schiff auf den Kreis zu platzieren.",
        trackingLost:
          "Bewegen Sie Ihr Smartphone, um die Fläche erneut zu finden",
        placeSecond:
          "Klicken Sie auf den Bildschirm, um das Schiff auf den Kreis zu platzieren",
        finished: "Klicken Sie auf das Symbol oben links, um die Animation abzuspielen oder auf die schwebenden Symbole"
      },
      currentStatus: "No Status",
    };
  },
  watch: {
    status(newStatus) {
      this.setStatus(newStatus)
    }
  },
  methods: {
    setStatus(statusName) {
      if(statusName === "hidden") {
        this.currentStatus = "was hidden before"
        this.isOpen = false;
      } else {
        this.isOpen = true;
      }

      switch (statusName) {
        case "findSurface":
          this.currentStatus = this.statusMessages["findSurface"];
          break;
        case "placeInitial":
          this.currentStatus = this.statusMessages["placeInitial"]
          break;
        case "trackingLost":
          this.currentStatus = this.statusMessages["trackingLost"]
          break;
        case "placeSecond":
          this.currentStatus = this.statusMessages["placeSecond"]
          break;
        case "finished":
          this.currentStatus = this.statusMessages["finished"]
          setTimeout(() => {
            this.isOpen = false;
          }, 5000)
          break;
        default:
          this.currentStatus = "No Status";
          break;
      }
    },
  },
};
</script>

<style scoped>
#ar-guide .q-card {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
