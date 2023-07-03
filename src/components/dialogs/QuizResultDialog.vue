<template>
  <q-dialog no-backdrop-dismiss no-esc-dismiss no-refocus ref="dialogRef" transition-show="fade" transition-hide="fade">
    <q-card square>
      <q-toolbar class="q-pr-none q-pa-md" :class="bgColor">
        <div class="text-h6 text-white text-weight-bold text-uppercase">
          Fertig!
        </div>
        <q-space />
        <!--q-btn
          flat
          v-close-popup
          icon="close"
          text-color="white"
          size="md"
          class="q-ml-sm"
        ></q-btn-->
      </q-toolbar>

      <q-card-section class="text-center">
        <p class="q-mb-none text-center">
          Herzlichen Glückwunsch, du hast das Quiz geschafft!
        </p>

        <p class="q-mt-md q-mb-none">Du hast</p>

        <p class="q-mb-none text-weight-bold text-h4 text-green-8">
          {{ points }}
        </p>

        <p class="q-mb-none">Punkte gesammelt!</p>
      </q-card-section>

      <q-card-actions align="center" class="bg-white text-primary">
        <q-btn class="text-weight-bold" unelevated color="green-8" text="white" :label="okText" @click="onOkClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import { computed } from 'vue'

const props = defineProps({
  points: {
    type: Number,
    required: true,
    default: 0,
  },
  color: {
    type: String,
    required: false,
    default: 'primary',
  },
  okText: {
    type: String,
    required: false,
    default: 'Ok',
  },
})

const bgColor = computed({
  get: () => {
    return 'bg-' + props.color
  },
})

defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK } = useDialogPluginComponent()

function onOkClick() {
  onDialogOK()
}
</script>
