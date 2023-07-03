<template>
  <q-dialog ref="dialogRef" id="quiz-card-dialog" position="bottom" maximized>
    <q-card style="background-color: transparent" class="no-shadow desktop-style">
      <div style="min-height: 50vh; pointer-events: none"></div>

      <div class="row bg-primary q-pa-sm border-radius">
        <q-space />
        <q-btn flat icon="close" @click="close" text-color="white" size="md" padding="none"></q-btn>
      </div>

      <div class="bg-white">
        <q-tabs v-model="currentTab" class="text-black" active-color="primary" indicator-color="primary" align="justify">
          <q-tab :id="info.question.id + '-tab'" v-for="info in orderInfo" :key="info.index" :name="info.question.id"
            :icon="getIcon(info)" :content-class="getColor(info)" :disable="isDisabled(info.index)">
          </q-tab>
        </q-tabs>

        <q-separator />

        <q-tab-panels keep-alive v-model="currentTab" animated>
          <q-tab-panel v-for="info in orderInfo" :key="info.index" :name="info.question.id">
            <AnswerList :question="info.question" @evaluate="evaluate"></AnswerList>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'
import { ref, toRef, toRaw } from 'vue'
import AnswerList from '../quiz/AnswerList.vue'

// quiz contains the whole quiz class instance and tab is the tab id that has been clicked on
const props = defineProps(['quiz', 'orderInfo', 'tab', 'urlPath'])

const tab1 = "about-the-ship"

const emits = defineEmits([
  ...useDialogPluginComponent.emits,
  'closeInfocardEvent',
  'animateCameraEvent',
  'evaluate',
])

// PROPS
//const quizRef = toRef(props, 'quiz')
const tabRef = toRef(props, 'tab')
const quizRef = toRef(props, 'quiz')

// we create a new reactive copy from the tab that has been clicked on
// the reason is, we cant change the prop (tabRef), which is required when we want to navigate with the displayed tabs in the quiz card dialog
let currentTab = ref(tabRef.value)

function isDisabled(greaterThan) {
  return greaterThan > quizRef.value.answeredQuestions
}

function getIcon(info) {

  // check if question is still locked
  if (info.index > quizRef.value.answeredQuestions) {
    return `o_lock`
  } else if (info.index == quizRef.value.answeredQuestions) {
    //return `dsm:${id}`
    return `img:models/${props.urlPath}/${info.icon}`
  }

  let currentQuestion = quizRef.value.data.questions.find(elem => elem.id == info.id)


  if (currentQuestion.answered) {
    return currentQuestion.answeredCorrect ? `done` : `close`
  } else {
    return `o_lock`
  }
}

function getColor(info) {
  let currentQuestion = quizRef.value.data.questions.find(elem => elem.id == info.id)

  if (currentQuestion.answered) {
    return currentQuestion.answeredCorrect ? `text-green-8` : `text-red-8`
  }
}

// Changes the view to the next tab in order
function getNext() {
  // Get the index of currentTab.value in the orderInfo

  let nextTab = props.orderInfo.find(elem => elem.index == quizRef.value.answeredQuestions)

  if (nextTab !== -1 && nextTab !== undefined) {
    setTimeout(() => {
      currentTab.value = nextTab.question.id
    }, 520)
  }
}

function close() {
  emits('closeInfocardEvent')
  onDialogCancel()
}

function evaluate(question, selectedAnswer) {
  quizRef.value.evaluateAnswer(question, selectedAnswer)

  getNext()
}

const { dialogRef, onDialogOk, onDialogCancel, onDialogHide } = useDialogPluginComponent()



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
