<template>
  <h5 class="text-center text-bold">{{ question.question }}</h5>

  <div class="column justify-center q-gutter-y-sm q-px-sm q-px-md-xl">

    <!-- Create a button for every possible answer -->
    <q-btn v-for="answer in question.answers" unelevated :disabled="question.answered === true" :key="answer.id" no-caps
      class="col-1 col-md-4 q-pa-lg text-bold" :color="buttonColor(answer)" text-color="white" :label="answer.text"
      @click="selectAnswer($event, answer)"></q-btn>

    <!-- Submit button -->
    <!--q-btn aria-label="Antwort bestätigen" class="col-1 col-md-4 q-pa-lg text-bold q-mt-xl" color="primary"
      text-color="white" :disabled="selectedAnswer == null || answered === true" label="Bestätigen" @click="evaluate()">
    </q-btn-->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

import OKCancelDialogVue from 'src/components/dialogs/OKCancelDialog.vue'

const $q = useQuasar()

let props = defineProps({
  question: {
    type: Object,
    required: true,
  },
})

let emit = defineEmits(['evaluate'])

let selectedAnswer = ref(null)
// get the answered status from the question
let answered = ref(props.question.answered)

// selects the answer, so it can be submitted
function selectAnswer(event, answer) {
  selectedAnswer.value = answer

  // Confirm the selected answer
  $q
    .dialog({
      component: OKCancelDialogVue,
      componentProps: {
        title: 'Antwort bestätigen',
        centered: true,
        message:
          `Bitte bestätige deine Antwort:<p class="q-mt-md text-weight-bold text-lg">${selectedAnswer.value.text}</p>`,
        okText: 'Ja',
        color: 'primary',
      },
    })
    .onOk(() => {
      emit('evaluate', props.question, selectedAnswer)
      answered.value = true
    })
}

function buttonColor(answer) {

  // if the question has been answered, show red/green for correct/incorrect answers
  if (answered.value === true) {
    if (answer.correct) {
      return 'green'
    } else {
      return 'red'
    }
  } else {
    // else, the question is not answered, so show the current selection
    if (selectedAnswer.value == answer) {
      return 'secondary'
    } else {
      return 'primary'
    }
  }
}
</script>
