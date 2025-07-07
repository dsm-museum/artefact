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


    // Add shadows
    experience.renderer.instance.shadowMap.type = BasicShadowMap;
    experience.renderer.instance.shadowMap.enabled = true

    /*experience.resources.on("loaded", (file) => {
      console.log(file)
      if (file) {
        file.receiveShadow = true
      }
    })*/
    //console.log(experience)

    // Make light brighter
    //let light1 = experience.scene.getObjectByName("Directional Light 1")
    //light1.castShadow = true
    let light2 = experience.scene.getObjectByName("Directional Light 2")
    light2.castShadow = true

    let amblight = experience.scene.getObjectByName("Ambient Light")
    if (amblight) {
      amblight.intensity = 0.5
    }

    /*if (light1) {
      light1.intensity = 2.2
    }*/

    if (light2) {
      light2.intensity = 3.0
      light2.shadow.bias = -0.0009
    }

    //console.log("onMounted Testviewer.vue: Start")
  } catch (e) {
    console.warn(e)
  }
})
</script>
