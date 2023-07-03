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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MenuBar from 'src/components/MenuBar.vue'

export default {
  setup() {
    const { locale } = useI18n({ useScope: "global" });
    const rightDrawerOpen = ref(false);
    return {
      locale,
      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      }
    };
  },
  components: { MenuBar }
}
</script>
