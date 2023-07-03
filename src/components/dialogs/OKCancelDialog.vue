<template>
  <q-dialog ref="dialogRef" transition-show="fade" transition-hide="fade">
    <q-card square>

      <q-toolbar class="q-pr-none q-pa-md" :class="bgColor">
        <div class="text-h6 text-white text-weight-bold text-uppercase">{{ title }}</div>
        <q-space />
        <q-btn flat v-close-popup icon="close" text-color="white" size="md" class="q-ml-sm"></q-btn>
      </q-toolbar>

      <q-card-section>
        <div :class="'centered' ? 'text-center' : ''" v-html=message></div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn class="text-white text-weight-bold" :class="bgColor" @click="onOkClick">
          {{ okText }}
        </q-btn>

        <q-btn class="text-white text-weight-bold" :class="bgColor" @click="onCancelClick">
          {{ cancelText }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar';
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
    default: "Title"
  },
  message: {
    type: String,
    required: true,
    default: "This is a dialog"
  },
  color: {
    type: String,
    required: false,
    default: "primary"
  },
  okText: {
    type: String,
    required: false,
    default: "Ok"
  },
  cancelText: {
    type: String,
    required: false,
    default: "Abbrechen"
  },
  centered: {
    type: Boolean,
    required: false,
    default: false
  }
})

const bgColor = computed({
  get: () => {
    return "bg-" + props.color
  }
})

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

function onOkClick() {
  onDialogOK()
}

function onCancelClick() {
  onDialogCancel()
}
</script>
