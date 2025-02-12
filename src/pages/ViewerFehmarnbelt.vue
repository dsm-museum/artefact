<template>
  <BaseViewer :modelId="MODEL_ID" />
</template>

<script setup>
import { onMounted } from "vue";
import BaseViewer from './BaseViewer.vue';

// CHANGE THIS
const MODEL_ID = "fehmarnbelt"

onMounted(async () => {
  console.log("onMounted Testviewer.vue: Start")
})
</script>
