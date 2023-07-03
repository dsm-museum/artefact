<template>
  <transition v-show="show" appear leave-active-class="animated fadeOut">
    <div id="loading-screen" class="non-selectable bg-grey-2 text-primary absolute-full flex flex-center">
      <div class="content q-pa-lg text-center">

        <q-img :src="require('src/assets/artefact-logo-transparent.svg')" fit="contain"
          style="min-width:150px; max-width:300px;" />


        <q-linear-progress class="q-mt-lg q-mb-sm" animation-speed="500" rounded size="30px" color="primary"
          :value="progress">
          <div class="absolute-full flex flex-center">
            <q-badge style="mix-blend-mode: difference" color="transparent" text-color="white"
              :label="progressLabel + '%'" />
          </div>
        </q-linear-progress>

        <div>
          <p class="q-ma-none text-weight-bold">Wird geladen</p>
          <q-spinner class="q-ma-sm" size="24px" color="primary" :thickness=7 />
        </div>
        <!--div class="q-mt-sm align-center block" id="progressDescription">{{ progressDescription }}</div-->
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: ["progress", "show", "progressLabel", "progressDescription"]
}
</script>

<style scoped>
#loading-screen {
  z-index: 100;
}

#progressDescription {
  word-wrap: break-word;
  max-width: 150px;
  margin-left: auto;
  margin-right: auto;
}
</style>
