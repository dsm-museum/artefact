<template>
  <q-layout view="hHh LpR fFf">

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="transparent">
      <MenuBar />
    </q-footer>

  </q-layout>
</template>

<script>
import MenuBar from 'src/components/MenuBar.vue'

export default {
  components: { MenuBar },
  setup() {

  }
}
</script>
