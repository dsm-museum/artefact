<template>
  <BaseViewer :modelId="MODEL_ID" />
</template>

<script setup>
// Currently not used for the chronometer, it still goes via CustomViewerChronometer.vue due to massive changes from the base viewer
import { onMounted } from "vue";
import BaseViewer from './BaseViewer.vue';

// CHANGE THIS
const MODEL_ID = "chronometer"

onMounted(async () => {
  console.log("onMounted Testviewer.vue: Start")
})
</script>
