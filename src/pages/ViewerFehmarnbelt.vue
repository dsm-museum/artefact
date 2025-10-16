<template>
  <BaseViewer :modelId="MODEL_ID" />
</template>

<script setup>
import { onMounted } from "vue";
import BaseViewer from './BaseViewer.vue';
import Experience from "src/scripts/Experience/Experience";
import { BufferGeometry, PointLight, PointLightHelper, Points, PointsMaterial, TextureLoader, Vector3 } from "three";
import anime from "animejs";

// CHANGE THIS
const MODEL_ID = "fehmarnbelt"

let flash
let rain

onMounted(async () => {
  let experience = new Experience()
  let sceneContents = experience.scene.getObjectByName("sceneContents")

  // Storm setup

  flash = setupFlash()
  let points = setupPoints()
  rain = await setupDroplets(points)
  sceneContents.add(flash, rain)

  experience.addEventListener("animationState", function (event) {
    if (!event.message) {
      flash.intensity = 0
    }
    darkening(event.message)
  })

  experience.addEventListener("beforeUpdate", function (event) {
    if (event.message) {
      raining(event.message)
    }
  })
})

function setupFlash() {
  let flash = new PointLight(0x062789, 0.2, 5, 0.1);
  flash.position.set(0.5, 2, 0.3);

  //let helper = new PointLightHelper(flash, 0.2, 0xff0000)
  //new Experience().scene.add(helper)

  return flash;
}

function setupPoints() {
  let points = []
  for (let i = 0; i < 300; i++) {
    let rainDrop = new Vector3(Math.random() - 0.5, 0.3, Math.random() - 0.5)
    points.push(rainDrop)
  }
  return points
}

async function loadRainTexture() {
  let loader = new TextureLoader()
  let file = await loader.loadAsync("./models/fehmarnbelt/media/raindrop.png")
  return file
}

async function setupDroplets(points) {
  let rainGeometry = new BufferGeometry().setFromPoints(points)
  let rainTexture = await loadRainTexture()


  let rainMaterial = new PointsMaterial({
    color: 0x66ffff,
    size: 0.01,
    map: rainTexture,
    sizeAttenuation: true,
    alphaTest: 0.3,
    transparent: true,
    opacity: 0.0
  })

  let pointsObject = new Points(rainGeometry, rainMaterial)
  return pointsObject
}

function setIntensity(value = 0) {
  this.flash.intensity = value
}

function darkening(start) {
  if (start) {
    anime({
      targets: rain.material,
      opacity: 0.5,
      easing: "linear",
      duration: 750,
    });
  } else {
    anime({
      targets: rain.material,
      opacity: 0.0, //0.3
      easing: "linear",
      duration: 750,
    });
  }

  rain.material.needsUpdate = true
}

function raining(start) {
  if (start) {
    if (Math.random() > 0.98 || flash.intensity > 15) {
      flash.intensity = 10 + Math.random() * 2;
    } else {
      flash.intensity = 0;
    }

    // animate rain
    let posArr = rain.geometry.getAttribute("position");
    for (let i = 1; i < posArr.array.length; i = i + 3) {
      // if the drop dropped, reset it
      if (posArr.array[i] < -0.2) {
        posArr.array[i] = 0.5;
      } else {
        posArr.array[i] -= 0.001 + Math.random() * 0.05;
      }
    }
    rain.geometry.attributes.position.needsUpdate = true;
  }
}
</script>
