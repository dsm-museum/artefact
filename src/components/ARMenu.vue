<template>
  <div class="row items-center">
    <q-btn @click="emitOnToggleAnimation" aria-label="Animation abspielen / pausieren"
      :class="hasAnimation ? '' : 'hidden'" :loading="!animationReady" :disabled="!animationReady" unelevated
      color="white" text-color="primary" :icon="_animationIsPlaying ? 'pause' : 'play_arrow'"
      class="col-4 text-bold rounded shadow-1" padding="1.4em 1.4em" />
    <q-btn @click="emitOnShowQuizIntro" aria-label="Quiz starten / beenden" flat unelevated color="transparent"
      :ripple="false" text-color="white" :icon="isRunning ? 'close' : 'img:icons/quiz-icon.png'"
      class="col text-bold square rounded no-hover icon-fix drop-shadow" :class="_hasQuiz != undefined ? '' : 'hidden'"
      size="3.5em" padding="none" style="width: 200px;" />
    <q-btn @click="emitOnStartAR" aria-label="Augmented Reality starten / beenden" text-color="primary" unelevated
      color="white" :icon="inAR ? 'close' : 'mdi-cube-scan'" class="col-4 text-bold rounded shadow-1"
      padding="1.4em 1.4em" :class="_deviceSupportsAR ? '' : 'hidden'" />
  </div>
</template>

<script setup>
import { ref, watch } from "vue"

const props = defineProps({
  deviceSupportsAR: {
    type: Boolean,
    required: true
  },
  animationIsPlaying: {
    type: Boolean,
    required: true
  },
  inAR: {
    type: Boolean,
    required: true
  },
  animationReady: {
    type: Boolean,
    required: true
  },
  isRunning: {
    type: Boolean,
    required: true
  },
  hasQuiz: {
    type: Boolean,
    required: false
  },
  arEnabled: {
    type: Boolean,
    default: false,
    required: false
  },
  hasAnimation: {
    default: false,
    required: true
  }
})

const _animationIsPlaying = ref(props.animationIsPlaying)
const _deviceSupportsAR = ref(props.deviceSupportsAR)
const _hasQuiz = ref(props.hasQuiz)

watch(() => props.animationIsPlaying, (newValue) => {
  _animationIsPlaying.value = newValue
})

watch(() => props.deviceSupportsAR, (newValue) => {
  _deviceSupportsAR.value = newValue
})

const emit = defineEmits(["onStartAR", "onToggleAnimation", "onShowQuizIntro"])

function emitOnStartAR() {
  if (!props.isRunning) {
    emit("onStartAR")
  }
}

function emitOnToggleAnimation() {
  _animationIsPlaying.value = !_animationIsPlaying.value
  emit("onToggleAnimation")
}

function emitOnShowQuizIntro() {
  emit("onShowQuizIntro")
}
</script>

<style scoped>
.text-bold {
  font-weight: bold !important;
}

.square {
  border-radius: 0px !important;
}

.rounded {
  border-radius: 10px !important;
}

.rounded-left {
  border-radius: 10px 0px 0px 10px;
}

.rounded-right {
  border-radius: 0px 10px 10px 0px;
}

.q-btn.no-hover .q-focus-helper {
  display: none;
}

.q-btn.icon-fix span {
  outline: 1px solid red !important;
  width: 100px !important;
  height: 100px !important;
}

.q-btn.drop-shadow .q-icon {
  filter: drop-shadow(3px 3px 2px rgb(0 0 0 / 0.4));
}
</style>
