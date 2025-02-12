<template>
  <BaseViewer :modelId="MODEL_ID" />
</template>

<script setup>
import { onMounted } from "vue";
import BaseViewer from './BaseViewer.vue';
const MODEL_ID = "chronometer"

onMounted(async () => {
  console.log("onMounted Testviewer.vue: Start")
})
</script>
