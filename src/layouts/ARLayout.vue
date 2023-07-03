<template>
  <div class="no-pointer-events non-selectable" id="ar-overlay" style="z-index: 99">
    <ARGuide :status="currentGuideStatus" />
  </div>
  <q-layout view="hHh LpR fFf">

    <q-page-container>
      <router-view @statuschange="onStatuschange" />
    </q-page-container>

    <q-footer class="transparent">
      <MenuBar />
    </q-footer>

  </q-layout>
</template>

<script>
import ARGuide from "src/components/ar/ARGuide.vue";
import MenuBar from "src/components/MenuBar.vue";

export default {
  components: { ARGuide, MenuBar },
  data() {
    return {
      currentGuideStatus: "hidden"
    }
  },
  beforeCreate() {
    document.body.style.overflow = "hidden";
  },
  beforeUnmount() {
    document.body.style.overflow = "";
  },
  methods: {
    onStatuschange(newStatus) {
      this.currentGuideStatus = newStatus
    }
  }
}
</script>


<style scoped>
</style>
