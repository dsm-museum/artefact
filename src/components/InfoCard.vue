<template>
  <q-dialog id="info-card-dialog" v-model="isOpen" position="bottom" square maximized>

    <!-- Main lightbox for all images -->
    <vue-easy-lightbox :visible="lightboxOpen" :imgs="lightboxImage" :zoomScale=1
      @hide="closeLightbox"></vue-easy-lightbox>

    <q-card style="background-color: transparent" class="no-shadow desktop-style">


      <div style="min-height:50vh; pointer-events: none"></div>
      <div class="row bg-primary q-pa-sm border-radius">
        <q-space />
        <q-btn flat icon="close" @click="close" text-color="white" size="md" padding="none"></q-btn>
      </div>

      <div class="bg-white">
        <q-tabs v-model="tab" class="text-primary" active-color="primary" indicator-color="primary" align="justify">
          <q-tab v-for="annotation in props.config.annotations" :key="annotation.id" :name="annotation.id"
            :icon="'img:models/' + props.config.urlPath + '/' + annotation.icon" content-class="icon-color">
          </q-tab>
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>

          <q-tab-panel v-for="annotation in props.config.annotations" :key="annotation.id" :name="annotation.id"
            class="container">
            <div class="q-px-md q-pb-md text-justify">
              <div class="text-weight-bold text-uppercase text-secondary text-left">
                {{ annotation.subtitle }}
              </div>
              <div class="text-h6 text-weight-bold text-left text-uppercase">
                {{ annotation.title }}
              </div>
              <div
                style="margin: 10px 0px; min-width: 20%; width: 50%; max-width: 70%; height: 16px; background-color: rgb(17, 30, 61);">
              </div>

              <div class="row q-col-gutter-md">
                <!-- TODO: V-if image -->
                <!-- Image -->
                <div v-if="checkProperty(annotation, 'media')" class="col-xs-12 col-sm-12 col-md-5 col-lg-3">
                  <q-img @click='showLightbox("./models/" + props.config.urlPath + "/" + annotation.media)'
                    class="cursor-pointer" :src='"./models/" + props.config.urlPath + "/" + annotation.media'
                    spinner-color="primary" />
                </div>

                <!-- Text Content -->
                <div class="col-xs-12 col-sm-12 col-md-7 col-lg-9">
                  <div v-for="paragraph in annotation.content" :key="paragraph" class="q-mb-sm" v-html="paragraph">
                  </div>
                </div>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import VueEasyLightbox from "vue-easy-lightbox";

const props = defineProps({
  config: {
    type: Object,
    required: true
  },
})


const emit = defineEmits(["closeInfocardEvent", "animateCameraEvent"])

let isOpen = ref(false)
let tab = ref("")
let lightboxOpen = ref(false)
let lightboxImage = ref([])

onMounted(async () => {
  for (let index in props.config) {
    console.log(index)
  }
})

const open = (index) => {
  isOpen.value = true
  tab.value = index
}

function close() {
  isOpen.value = false
  emit("closeInfocardEvent")
}

function showLightbox(imageToShow) {
  lightboxOpen.value = true
  lightboxImage.value = imageToShow
}

function closeLightbox() {
  lightboxOpen.value = false
}

function checkProperty(obj, propertyName) {
  return (
    obj.hasOwnProperty(propertyName) &&
    obj[propertyName] !== undefined &&
    obj[propertyName] !== null &&
    obj[propertyName] !== ""
  )
}

defineExpose({
  open
})
</script>


<style scoped>
/* Extra small devices (600px and down) */
@media screen and (max-width: 600px) {
  .desktop-style>* {
    margin-left: 0px;
    margin-right: 0px;
  }

  .border-radius {
    border-radius: 0px !important;
  }

}

/* Small devices (portrait tablets and large phones , 600px and up) */
@media screen and (min-width: 600px) {
  .desktop-style>* {
    margin-left: 0px;
    margin-right: 0px;
  }

  .border-radius {
    border-radius: 0px !important;
  }
}

/* Medium devices (landscape tablets, 768px and up) */
@media screen and (min-width: 768px) {
  .desktop-style>* {
    margin-left: 100px;
    margin-right: 100px;
  }

  .border-radius {
    border-radius: 15px 15px 0px 0px !important;
  }
}

/* Large devices (laptops and desktops, 992px and up) */
@media screen and (min-width: 992px) {
  .desktop-style>* {
    margin-left: 100px;
    margin-right: 100px;
  }

  .border-radius {
    border-radius: 15px 15px 0px 0px !important;
  }
}

/* Extra large devices (large laptops and desktops, 1200px and up) */
@media screen and (min-width: 1200px) {
  .desktop-style>* {
    margin-left: 200px;
    margin-right: 200px;
  }

  .border-radius {
    border-radius: 15px 15px 0px 0px !important;
  }
}

/* Huge devices (touch tables, 1600px and up) */
@media screen and (min-width: 1600px) {
  .desktop-style>* {
    margin-left: 400px;
    margin-right: 400px;
  }

  .border-radius {
    border-radius: 15px 15px 0px 0px !important;
  }
}

.icon-color {
  color: #002c50
}
</style>
