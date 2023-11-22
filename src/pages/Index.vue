<template>
  <q-page>
    <div class="row justify-center">
      <div class="q-px-md col-12 col-sm-8 col-md-5 q-py-md">

        <!-- show the example model if it exists -->
        <q-card @click="$router.push('/models/fehmarnbelt')" v-ripple class="my-card cursor-pointer q-hoverable">
          <span class="q-focus-helper"></span>
          <q-img alt="An image of a ship in a storm at sea" :ratio="16 / 9" fit="cover" spinner-color="primary"
            position="50% 80%"
            :src="'./models/' + modelconfigs['fehmarnbelt'].urlPath + '/' + modelconfigs['fehmarnbelt'].thumbnail">
          </q-img>

          <q-item class=" bg-primary text-white q-pa-md">
            <div class="text-h6 text-weight-bold">3D und Augmented Reality Experience</div>
          </q-item>

          <q-card-section class="non-selectable">
            <div class="text-subtitle2">Interaktive 3D- und AR-Anwendung im Museum und für Zuhause: Mithilfe von Augmented
              Reality werden die ausgestellten Schiffsmodelle erweitert. So können Informationen zu bestimmten Teilen des
              Schiffes angezeigt und Animationen abgespielt werden. Klicken Sie zum Starten einfach hier.</div>
          </q-card-section>

          <q-separator inset />

          <q-card-actions vertical>
            <q-btn padding="lg" flat color="primary" class="text-weight-bold q-ma-sm q-mx-md">Ansehen</q-btn>
          </q-card-actions>

        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { modelconfigs } from 'src/boot/load_configs';

</script>
