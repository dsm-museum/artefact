<template>
  <q-page>
    <div class="row justify-center">
      <div class="q-px-md col-12 col-sm-8 col-md-5 q-py-md">

        <!--h1 class="text-h3 text-center q-my-lg q-mt-none q-mb-none text-weight-bold non-selectable">ARtefact</h1-->

        <div class="text-center q-my-xl">
          <q-img src="~/src/assets/artefact-logo-standalone.svg" fit="contain" width="150px"></q-img>
        </div>

        <!-- show the example model if it exists -->
        <q-card v-if="modelconfigs['example']" @click="$router.push('/models/example')" v-ripple
          class="my-card cursor-pointer q-hoverable">
          <span class="q-focus-helper"></span>
          <q-img alt="An image of a ship in a storm at sea" :ratio="16 / 9" fit="cover" spinner-color="primary"
            :src="'./models/' + modelconfigs['example'].urlPath + '/' + modelconfigs['example'].thumbnail">
          </q-img>

          <q-item class=" bg-primary text-white q-pa-md">
            <div class="text-h6 text-weight-bold">Enrich your museum experience</div>
          </q-item>

          <q-card-section class="non-selectable">
            <div class="text-subtitle2">Try out ARtefact, a progressive web app app that enhances museum exhibits with
              3D visualizations and animations. Utilizing Augmented Reality, this app can offer informative content and
              contextual details for your artifacts.</div>
          </q-card-section>

          <q-separator inset />

          <q-card-actions vertical>
            <q-btn padding="lg" flat color="primary" class="text-weight-bold q-ma-sm q-mx-md">{{ $t('view') }}</q-btn>
          </q-card-actions>

        </q-card>

        <h1 class="text-h3 q-mb-none text-bold">Project Info</h1>

        <div class="q-my-lg">
          The repository of this project can be found at <a
            href="https://github.com/dsm-museum/artefact">https://github.com/dsm-museum/artefact</a>
        </div>

        <div class="q-mt-lg rounded-borders text-white q-pa-md" style="background-color: rgba(0, 44, 80, 1.0);"><span
            class="text-bold">ARtefact</span> is developed at the
          <a class="text-white" href="https://dsm.museum">German Maritime Museum in Bremerhaven</a>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { modelconfigs } from 'src/boot/load_configs';

</script>
