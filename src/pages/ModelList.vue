<template>
  <div class="row justify-center">
    <div class="q-px-md col-12 col-sm-8 col-md-5 q-py-md">
      <h1 class="text-h5 q-mt-none q-mb-none text-weight-bold text-uppercase non-selectable">Modelle</h1>

      <!-- horizon line-->
      <div class="q-my-none q-mb-md" style="max-width: 50%; border-bottom: 20px solid #002c50"></div>

      <q-card v-for="model in appConfig" :key="model" @click="$router.push(`/models/${model.url}`)" v-ripple
        class="my-card cursor-pointer q-hoverable q-mb-lg">
        <span class="q-focus-helper"></span>
        <q-img :ratio="16 / 9" spinner-color="primary" fit="cover" position="50% 50%"
          :src="`/models/${model.url}/${model.thumbnail}`">
        </q-img>

        <q-item class="bg-primary text-white q-pa-md">
          <div class="text-h6 text-weight-bold">{{ model.title }}</div>
        </q-item>

        <q-card-section class="non-selectable">
          <div class="text-subtitle2">{{ model.description }}</div>
        </q-card-section>

        <q-separator inset />

        <q-card-actions vertical>
          <q-btn padding="md" flat color="primary" class="text-weight-bold q-ma-sm q-mx-md">Ansehen</q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import appConfig from "src/config.json"
</script>
