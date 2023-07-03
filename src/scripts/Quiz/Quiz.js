import EventEmitter from '../Experience/utils/EventEmitter'
import { EventDispatcher } from 'three'

export default class Quiz extends EventDispatcher {
  constructor(_data, _shuffle = true) {
    super()
    this.data = this.setData(_data, _shuffle)
    this.length = this.getLength()

    // Status Information
    this.finished = false
    this.isRunning = false
    this.points = 0
    this.comboCount = 0
    this.currentQuestion = null
    this.answeredQuestions = 0
  }

  setData(data, shuffle) {
    if (shuffle) {
      for (let index in data.questions) {
        data.questions[index].answers.sort(() => Math.random() - 0.5)
        data.questions[index].answered = false
        data.questions[index].answeredCorrect = false
      }
    }

    return data
  }

  getLength() {
    return Object.keys(this.data.questions).length
  }

  reset() {
    this.isRunning = false
    this.points = 0
    this.answeredQuestions = 0

    // Also set all questions back to unanswered
    for (let index in this.data.questions) {
      this.data.questions[index].answered = false
    }
  }

  addPoints(amount) {
    this.points += Math.abs(amount)
  }

  removePoints(amount) {
    this.points -= Math.abs(amount)
  }

  start() {
    this.isRunning = true
    //this.trigger('start')
    this.dispatchEvent({ type: 'start' })
  }

  evaluateAnswer(question, selectedAnswer) {
    // mark this question as answered
    question.answered = true

    // increment the number of answered questions in this quiz
    this.answeredQuestions += 1

    // check if selected answer was the correct one
    let result = selectedAnswer.value.correct

    // store if the answer has been answered correct (for the cross and checkmark signifier in the tabs)
    question.answeredCorrect = result

    // if the result was correct, add points to the players score
    if (result) {
      this.addPoints(10)
    }

    // triggers the event for showing the answer text
    this.dispatchEvent({
      type: 'showAnswer',
      message: { explanationText: question.explanationText, correct: result },
    })

    return result
  }

  finishQuiz() {
    // If all questions have been answered, trigger the "finished" event
    if (this.answeredQuestions >= this.length) {
      //this.trigger('finished')
      this.finished = true
      console.log('Quiz finished')

      this.dispatchEvent({ type: 'finished' })
    }
  }
}
