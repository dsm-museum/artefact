<template>
  <q-dialog ref="dialogRef" id="quiz-card-dialog" position="bottom" maximized>
    <q-card style="background-color: transparent" class="no-shadow desktop-style">
      <div style="min-height: 50vh; pointer-events: none"></div>

      <div class="row bg-primary q-pa-sm border-radius">
        <q-space />
        <q-btn flat icon="close" @click="close" text-color="white" size="md" padding="none"></q-btn>
      </div>

      <div class="bg-white">
        <q-tabs v-model="currentTab" class="text-black" active-color="primary" indicator-color="primary"
          align="justify">
          <q-tab v-for="annotation in config" :id="annotation.id + '-tab'" :key="annotation.index" :name="annotation.id"
            :icon="getIcon(annotation)" :content-class="getColor(annotation)" :disable="isDisabled(annotation)">
          </q-tab>
        </q-tabs>

        <q-separator />

        <q-tab-panels keep-alive v-model="currentTab" animated>
          <q-tab-panel v-for="annotation in config" :key="annotation.index" :name="annotation.id">
            <AnswerList :question="annotation.quiz" @evaluate="evaluate"></AnswerList>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import { ref, toRef } from 'vue'
import AnswerList from '../quiz/AnswerList.vue'

// quiz contains the whole quiz class instance and tab is the tab id that has been clicked on
const props = defineProps(['quiz', 'config', 'data', 'tab', 'urlPath'])
const emits = defineEmits([
  ...useDialogPluginComponent.emits,
  'closeInfocardEvent',
  'animateCameraEvent',
  'evaluate',
])

// PROPS
//const quizRef = toRef(props, 'quiz')
const tabRef = toRef(props, 'tab')
//const quizRef = toRef(props, 'quiz')

// we create a new reactive copy from the tab that has been clicked on
// the reason is, we cant change the prop (tabRef), which is required when we want to navigate with the displayed tabs in the quiz card dialog
let currentTab = ref(tabRef.value)

function isDisabled(currentQuestion) {
  return currentQuestion.index > props.quiz.answeredQuestions
}

function getIcon(annotation) {
  //console.log("annotation", annotation)
  // check if question is still locked
  if (annotation.index > props.quiz.answeredQuestions) {
    return `o_lock`
  } else if (annotation.index == props.quiz.answeredQuestions) {
    return `img:models/${props.urlPath}/${annotation.icon}`
  }

  //console.log(props.config)
  let currentQuestion = props.config.find(elem => elem.id == annotation.id)

  if (currentQuestion.quiz.answered) {
    return currentQuestion.quiz.answeredCorrect ? `done` : `close`
  } else {
    return `o_lock`
  }
}

function getColor(annotation) {
  let currentQuestion = props.config.find(elem => elem.id == annotation.id)

  if (currentQuestion.quiz.answered) {
    return currentQuestion.quiz.answeredCorrect ? `text-green-8` : `text-red-8`
  }
}

// Changes the view to the next tab in order
function getNext() {
  // Get the index of currentTab.value in the orderInfo
  let nextTab = props.config.find(elem => elem.index == props.quiz.answeredQuestions)

  if (nextTab !== -1 && nextTab !== undefined) {
    setTimeout(() => {
      currentTab.value = nextTab.id
    }, 520)
  }
}

function close() {
  emits('closeInfocardEvent')
  onDialogCancel()
}

function evaluate(question, selectedAnswer) {
  props.quiz.evaluateAnswer(question, selectedAnswer)

  getNext()
}

const { dialogRef, onDialogCancel } = useDialogPluginComponent()



</script>


<style scoped>
/** Does not work currently (wrong selector), but a good way to hide ugly scrollbars for touch table use, investigate further (also col-width depending on size) */
#quiz-card-dialog {
  scrollbar-width: none;
}

.desktop-style>* {
  margin-left: 320px;
  margin-right: 320px;
}

.border-radius {
  border-radius: 15px 15px 0px 0px !important;
}

@media screen and (max-width: 1024px) {
  .desktop-style>* {
    margin-left: 0px;
    margin-right: 0px;
  }

  .border-radius {
    border-radius: 0px !important;
  }
}
</style>
