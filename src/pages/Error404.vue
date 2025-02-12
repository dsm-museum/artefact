<template>
  <div id="errorpage" class="bg-white text-primary text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 20vh">
        404
      </div>

      <div class="text-h4" style="opacity:.4">
        Die Seite wurde nicht gefunden.
      </div>

      <q-btn class="q-mt-xl q-pa-md text-bold" color="primary" text-color="white" unelevated to="/"
        label="Zurück zum Start" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorPage404'
})
</script>


<style>
#errorpage {
  z-index: 1;
  min-height: inherit;
}
</style>
