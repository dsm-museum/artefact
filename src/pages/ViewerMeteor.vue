<template>
  <BaseViewer :modelId="MODEL_ID" />
</template>

<script setup>
import { onMounted } from "vue";
import BaseViewer from './BaseViewer.vue';
import Experience from "src/scripts/Experience/Experience";
import { BasicShadowMap } from "three";

// CHANGE THIS
const MODEL_ID = "meteor"

onMounted(async () => {
  try {
    let experience = new Experience()

    experience.resources.on("loaded", (file) => {
      console.log(file)
      if (file) {
        file.receiveShadow = true
      }
    })

    // Add shadows
    experience.renderer.instance.shadowMap.type = BasicShadowMap;
    experience.renderer.instance.shadowMap.enabled = true

    // Make light brighter
    let light1 = experience.scene.getObjectByName("Directional Light 1")
    light1.castShadow = true

    // Directional Light 2 is the back light
    let light2 = experience.scene.getObjectByName("Directional Light 2")
    light2.castShadow = true

    let amblight = experience.scene.getObjectByName("Ambient Light")
    if (amblight) {
      amblight.intensity = 0.7
    }

    if (light2) {
      light2.intensity = 0.7
      light2.shadow.bias = -0.0009
    }

    if (light1) {
      light1.intensity = 2.8
    }

    //console.log("onMounted Testviewer.vue: Start")
  } catch (e) {
    console.warn(e)
  }
})
</script>
