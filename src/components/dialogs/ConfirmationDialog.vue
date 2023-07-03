<template>
  <q-dialog ref="dialogRef" no-backdrop-dismiss no-esc-dismiss transition-show="fade" transition-hide="fade">
    <q-card>
      <q-toolbar class="q-pr-none q-pa-md" :class="bgColor">
        <div class="text-h6 text-white text-weight-bold text-uppercase">
          {{ title }}
        </div>
        <q-space />
        <q-btn flat v-close-popup icon="close" text-color="white" size="md" class="q-ml-sm" @click="onHideClick">
        </q-btn>
      </q-toolbar>

      <q-card-section>
        {{ message }}
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md">
        <q-btn unelevated class="text-white text-weight-bold" :class="bgColor" @click="onOkClick">
          {{ okText }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
    default: 'Title',
  },
  message: {
    type: String,
    required: true,
    default: 'This is a dialog',
  },
  color: {
    type: String,
    required: false,
    default: 'primary',
  },
  okText: {
    type: String,
    required: false,
    default: 'Verstanden',
  },
})

const bgColor = computed({
  get: () => {
    return 'bg-' + props.color
  },
})

const emits = defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent()

function onOkClick() {
  onDialogOK()
}

function onHideClick() {
  onDialogHide()
}
</script>
