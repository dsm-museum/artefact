<template>
  <router-view />
</template>

<script>
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'

// Here are all custom icons defined that are used in the UI (in the navigation bar e.g.)
const customIcon = {
  'yourprefix:youricon': 'img:icons/myicon.svg',
  'artefact:quiz': 'img:icons/quiz-icon.svg',
  'chronometer:upward': 'img:icons/chronometer-upward.svg',
  'chronometer:downward': 'img:icons/chronometer-downward.svg'
}

/** Entrypoint of the app */
export default defineComponent({
  name: 'App',
  setup() {
    const $q = useQuasar()

    // Creates icons that can be used by vue, see https://quasar.dev/vue-components/icon#2-simply-mapping-a-few-icons
    $q.iconMapFn = (iconName) => {
      const icon = customIcon[iconName]
      if (icon !== void 0) {
        return { icon: icon }
      }
    }
  },
})
</script>
