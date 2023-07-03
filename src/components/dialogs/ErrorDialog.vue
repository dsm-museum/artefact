<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card>

      <q-card-section class="bg-primary text-white">
        <div class="text-h6 text-weight-bold">{{ errorTitle }}</div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        {{ errorDescription }}
      </q-card-section>

      <q-card-section class="q-py-none">
        <q-expansion-item label="Fehler anzeigen">
          <pre id="log" class="rounded-borders">{{ errorMessage }}</pre>
        </q-expansion-item>
      </q-card-section>

      <q-card-actions align="center" class="bg-white text-primary">
        <q-btn class="text-weight-bold" unelevated color="primary" text="white" label="OK" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>


<script setup>
import { useDialogPluginComponent } from 'quasar'

const props = defineProps({
  errorTitle: {
    type: String,
    default: "Ein Fehler ist aufgetreten",
    required: false
  },
  errorDescription: {
    type: String,
    default: "Leider kann diese Funktion gerade nicht gestartet werden",
    required: false
  },
  errorMessage: {
    type: String,
    default: "Es ist ein unbekannter Fehler aufgetreten",
    required: false
  }
})


defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide } = useDialogPluginComponent()

</script>


<style scoped>
#log {
  white-space: pre-wrap;
  /* Since CSS 2.1 */
  white-space: -moz-pre-wrap;
  /* Mozilla, since 1999 */
  white-space: -pre-wrap;
  /* Opera 4-6 */
  white-space: -o-pre-wrap;
  /* Opera 7 */
  word-wrap: break-word;

  padding: 8px 16px;
  background-color: #eeeeee;
}
</style>
