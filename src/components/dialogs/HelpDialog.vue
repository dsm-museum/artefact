<template>
  <q-dialog
    ref="dialogRef"
    id="help-dialog"
    transition-show="fade"
    transition-hide="fade"
    full-height
    full-width
  >
    <q-card square class="q-pa-md">
      <div class="text-h6 text-weight-bold text-center">{{ title }}</div>

      <!-- Hier Tabelle 2x3, links für touch, rechts für maus -->
      <div class="row items-center justify-evenly">
        <div class="column items-center">
          <div class="col">
            <q-img
              src="https://cdn.quasar.dev/img/non-existent-image-src.png"
              style="height: 140px; max-width: 150px"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-blue text-white">
                  Test
                </div>
              </template>
            </q-img>
          </div>
          <div class="col">
            <q-img
              src="https://cdn.quasar.dev/img/non-existent-image-src.png"
              style="height: 140px; max-width: 150px"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-blue text-white">
                  Test
                </div>
              </template>
            </q-img>
          </div>
        </div>
      </div>

      <div class="row items-center justify-evenly">
        <div class="col">
          <q-img
            src="https://cdn.quasar.dev/img/non-existent-image-src.png"
            style="height: 140px; max-width: 150px"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-blue text-white">
                Test
              </div>
            </template>
          </q-img>
        </div>
        <div class="col">
          <q-img
            src="https://cdn.quasar.dev/img/non-existent-image-src.png"
            style="height: 140px; max-width: 150px"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-blue text-white">
                Test
              </div>
            </template>
          </q-img>
        </div>
      </div>

      <div class="row items-center justify-evenly">
        <div class="col">
          <q-img
            src="https://cdn.quasar.dev/img/non-existent-image-src.png"
            style="height: 140px; max-width: 150px"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-blue text-white">
                Test
              </div>
            </template>
          </q-img>
        </div>
        <div class="col">
          <q-img
            src="https://cdn.quasar.dev/img/non-existent-image-src.png"
            style="height: 140px; max-width: 150px"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-blue text-white">
                Test
              </div>
            </template>
          </q-img>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'

const props = defineProps({
  title: {
    type: String,
    required: true,
    default: 'Hilfe',
  },
})

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK } = useDialogPluginComponent()

function onOkClick() {
  onDialogOK()
}
</script>
