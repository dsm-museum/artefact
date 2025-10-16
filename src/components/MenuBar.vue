<template>
  <div class="row justify-center text-primary full-width">
    <q-btn-group class="col-xs-12 col-sm-7 col-lg-4 border-radius">
      <!--q-btn flat class="col-6 bg-white q-py-lg q-px-lg text-bold" to="/" label="Start" icon="o_home"></q-btn-->
      <q-btn flat class="col-xs-6 bg-white q-py-lg q-px-lg text-bold" to="/models" label="Modelle"
        icon="o_directions_boat"></q-btn>
      <q-btn flat class="col-xs-6 bg-white q-py-lg q-px-lg text-bold" to="/about" label="About" icon="o_info"></q-btn>
    </q-btn-group>
  </div>
</template>


<script>
export default {

}
</script>

<style scoped>
.border-radius {
  border-radius: 15px 15px 0px 0px !important;
}

.bold div.q-tab__label {
  font-weight: bold;
}
</style>
