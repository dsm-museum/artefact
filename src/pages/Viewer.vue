<template>
  <q-page id="arScene">
    <loading-screen :show="showLoadingScreen" :progress="loadingProgress" :progress-label="progressLabel"
      :progress-description="progressDescription"></loading-screen>

    <info-card id="info-card" :config="config" ref="infocardRef" @closeInfocardEvent="closeInfocard" />

    <div id="annotations" style="z-index: 99;"></div>

    <q-page-sticky id="arMenu-container" position="top" :offset="[0, 24]" style="z-index: 99">
      <a-r-menu id="arMenu" :isRunning="isRunning" :hasQuiz="config.quiz != undefined" :animationReady="animationReady"
        :deviceSupportsAR="deviceSupportsAR" :arEnabled="config.ar" :animationIsPlaying="animationIsPlaying" :inAR="inAR"
        @onStartAR="startAR" @onToggleAnimation="toggleAnimation" @onShowQuizIntro="showQuizIntro">
      </a-r-menu>
    </q-page-sticky>

    <q-resize-observer @resize="resize" />

    <canvas id="arCanvas" />
  </q-page>
</template>

<script setup>
import { toRaw, onMounted, onUnmounted, ref, computed } from 'vue'
import anime from "animejs/lib/anime.es"
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar';
import { Group, Vector3 } from 'three';

/* Own Imports */
import Experience from 'src/scripts/Experience/Experience';
import LoadingScreen from 'src/components/LoadingScreen.vue';
import InfoCard from 'src/components/InfoCard.vue';
import ARMenu from 'src/components/ARMenu.vue';
import ErrorDialog from 'src/components/dialogs/ErrorDialog.vue';
import ConfirmationDialog from 'src/components/dialogs/ConfirmationDialog.vue';
import OKCancelDialog from 'src/components/dialogs/OKCancelDialog.vue';
import QuizCardDialog from 'src/components/dialogs/QuizCardDialog.vue';
import { modelconfigs } from 'src/boot/load_configs';
import Quiz from 'src/scripts/Quiz/Quiz';
import QuizResultDialog from 'src/components/dialogs/QuizResultDialog.vue';

// Main Config
let route
let config = ref({})
let experience

// Menu and UI
let animationReady = ref(true)
let animationIsPlaying = ref(false)
let showLoadingScreen = ref(true)
let loadingProgress = ref(0)
let progressLabel = ref(0)
let progressDescription = ref("")
let infocardRef = ref(null)

// Quiz
const $q = useQuasar()
let quiz
let quizDialog
let isRunning = ref(false)
let annotationsAndQuiz = ref([])

// Augmented Reality
let deviceSupportsAR = ref(false)
let inAR = ref(false)
let currentXRSession = ref({})
let modelWasPlaced = false
let arModelGroup = new Group()

// Signal definitions
const emit = defineEmits(["statuschange"])

// ToDO:
// check if animation exists -> if not, hide animation button

onMounted(async () => {
  route = useRoute()
  config.value = modelconfigs[route.params.id]
  annotationsAndQuiz = mergeAnnotationsAndQuiz(config.value.annotations, config.value.quiz.questions)

  createExperience()

  // Insert annotations into the scene
  for (let data of annotationsAndQuiz) {
    let annotation = experience.annotationSystem.createAnnotation(data.annotation, config.value.urlPath)

    arModelGroup.add(annotation.target)

    experience.click(annotation.target, (event) => {
      if (!quiz.isRunning) {
        openInfocard(data.id)
      } else {
        if (data.index <= quiz.answeredQuestions) {

          quizDialog = $q.dialog({
            component: QuizCardDialog,
            componentProps: {
              quiz: quiz,
              orderInfo: annotationsAndQuiz,
              urlPath: config.value.urlPath,
              tab: data.id
            }
          })
        } else {
          console.log("locked")
        }
      }
    })
  }

  // Prepare quiz content
  quiz = new Quiz(toRaw(config.value.quiz))

  // Add the AR group to the scene
  experience.scene.add(arModelGroup)

  // Add other event listeners
  addEventListeners()
})

onUnmounted(() => {
  experience.dispose()
})

function createExperience() {
  experience = new Experience({
    sources: [{
      name: "model",
      id: "model",
      type: "gltfModel",
      path: `./models/${route.params.id}/${config.value.model}`
    }],
  })

  // Connect the resize event for correct resizing of the scene
  experience.resizer.on("resize", () => {
    resize()
  })

  experience.resources.on(
    'progress',
    (loaded, toLoad, description) => {
      loadingProgress.value = loaded / toLoad
      progressLabel.value = ((loaded / toLoad) * 100).toFixed(0)
      progressDescription.value = 'Lade ' + description
    }
  )

  // The "loaded" event is triggered after the first 3d model is loaded.
  // If there are other 3d models defined in the "additionalModels" section of the config
  experience.resources.on("loaded", () => {
    showLoadingScreen.value = false

    // Make the model non-reactive as that is needed for the renderer to show the animation
    let gltfFile = toRaw(experience.resources.items["model"])

    arModelGroup.add(gltfFile.scene)

    // Do not add it to the scene but rather the arModelGroup
    //experience.scene.add(model.scene)

    // Testing animation playback
    //let mesh = gltfFile.scene.children.find(child => child.name === config.value.animationMesh)
    //let mixer = new AnimationMixer(mesh)

    //mixer.clipAction(gltfFile.animations[0]).play()


    // Adds the gltfFiles raw animations to the internal array
    experience.animationSystem.addAnimations(gltfFile.animations)

    // Get the mesh to play the animation on
    let mesh = gltfFile.scene.children.find(child => child.name === config.value.animationMesh)

    // Add the mixer for the main mesh
    experience.animationSystem.addMixer(mesh, "mainMeshMixer")

    // Adds the model to the animation system to start the animation later
    //experience.animationSystem.register(mesh, "mainAnimation")

    // Load additional 3d models if defined
    if (config.value.additionalModels) {
      for (let model of config.value.additionalModels) {
        let path = `./models/${route.params.id}/${model}`
        experience.resources.load(path)
      }
    }
  })

  // Is triggered for every 3d model loading after the first file
  experience.resources.on("modelReady", (file) => {
    // add the loaded model to the arModelGroup
    arModelGroup.add(file.scene)
  })

  experience.webXR.on("error", (errorTitle, errorDescription, errorMessage) => {
    $q.dialog({
      component: ErrorDialog,
      componentProps: {
        errorTitle: errorTitle,
        errorDescription: errorDescription,
        errorMessage: errorMessage
      }
    })
  })

  // For enabling the ar button in the top menu
  experience.webXR.on("supportsAR", (xrInfo) => {
    if (xrInfo) {
      deviceSupportsAR.value = true
    }
  })

  experience.webXR.on("onSessionStarted", (xrSession) => {
    onSessionStarted(xrSession)
  })

  experience.webXR.on("onSessionEnded", () => {
    onSessionEnded()
  })

  experience.renderer.instance.setAnimationLoop((timestamp, frame) => {
    update(timestamp, frame)
  })

}

function resize() {
  if (experience) {
    experience.camera.resize()
    experience.renderer.resize()
  }
}

function update(timestamp, frame) {

  // XR update
  if (frame) {
    const referenceSpace = experience.renderer.instance.xr.getReferenceSpace()
    const session = experience.renderer.instance.xr.getSession()

    // Request a hit test setup once
    if (experience.webXR.hitTestSourceRequested === false) {
      session.requestReferenceSpace("viewer").then(function (referenceSpace) {
        session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
          experience.webXR.hitTestSource = source
        })
      })

      // The hit testing setup for the session is done
      experience.webXR.hitTestSourceRequested = true
    }

    if (experience.webXR.hitTestSource) {
      // Get the hits with the current source
      const hitTestResults = frame.getHitTestResults(experience.webXR.hitTestSource)

      // If we have at least one hit
      if (hitTestResults.length) {

        // Get the first hit
        const hit = hitTestResults[0]

        // Show the indicator
        if (!experience.webXR.indicator.shownOnce) {
          experience.webXR.indicator.shownOnce = true
          experience.webXR.indicator.enable()

          //emit a signal to the AR guide that the artefact can be placed now
          emit('statuschange', 'placeInitial')
        } else {
          const pose = hit.getPose(referenceSpace).transform.matrix

          experience.webXR.indicator.mesh.matrix.fromArray(pose)
        }
        //object.matrix
      } else {
        // no hitTestResults, hide the indicator again
        experience.webXR.indicator.visible = false
      }
    }
  }

  // Framework update
  experience.timer.update()

  experience.camera.instance.updateMatrixWorld()
  experience.annotationSystem.update(frame !== undefined)

  // Iterate over every mixer to update the animation
  if (experience.animationSystem.mixers.length !== 0) {
    for (let i = 0, m = experience.animationSystem.mixers.length; i < m; i++) {
      experience.animationSystem.mixers[i].mixer.update(
        experience.timer.delta / 1000
      )
    }
  }

  experience.controls.update()
  experience.raycaster.update()

  // Keep this last, render the final frame
  experience.renderer.update()
}

function toggleAnimation() {
  animationIsPlaying.value = !animationIsPlaying.value

  // Get the mainAnimation
  let action = experience.animationSystem.getAction(config.value.animationName, "mainMeshMixer")

  if (animationIsPlaying.value) {
    action.paused = false
    action.play()
  } else {
    action.paused = true
  }
}

function startAR() {
  experience.webXR.startSession()
}

// Starts the quiz after sucessful confirmation
function showQuizIntro() {

  // Show the confirmation dialog if the quiz is not running
  if (!quiz.isRunning) {
    $q.dialog({
      component: ConfirmationDialog,
      componentProps: {
        title: "Quiz starten",
        message: 'Kleiner Tipp: Es lohnt sich bevor du mit dem Quiz beginnst, die Texte gut zu kennen, denn dort verstecken sich wichtige Infos!',
        okText: "Quiz starten",
        color: "primary"
      }
    }).onOk(() => {
      startQuiz()
    })
  } else {
    // Show the cancel dialog
    $q.dialog({
      component: OKCancelDialog,
      componentProps: {
        title: "Quiz beenden",
        message: "Willst du das Quiz wirklich beenden? Bitte beachte, dass dann dein Fortschritt verloren geht und du von vorne anfangen musst.",
        okText: "Ja"
      }
    }).onOk(() => {
      resetQuiz()
    })
  }
}

async function onSessionStarted(xrSession) {
  // Should be handled by webxr and actually is already
  currentXRSession.value = xrSession
  inAR.value = true

  // Hide the group that shall be placeable
  arModelGroup.visible = false

  // Setting up the fade in from the bottom
  arModelGroup.position.y = -5

  // Listener for the end of a WebXR session
  experience.webXR.currentSession.addEventListener("end", onSessionEnded)

  // Listener for a click event
  experience.webXR.currentSession.addEventListener("select", onXRSelect)
  experience.webXR.currentSession.addEventListener("touchstart", onTouchStart)

  // Set the referenceSpaceType for the session (yes, session)
  experience.renderer.instance.xr.setReferenceSpaceType('local')

  // Set the current session to the active one
  await experience.renderer.instance.xr.setSession(currentXRSession.value)

  // Hide the canvas to make room for the camera feed
  //document.querySelector("#arCanvas").style.visibility = "hidden"

  // Instead change the opacity of the canvas to still receive pointer events
  document.querySelector("#arCanvas").style.opacity = 0

  //document.querySelector("#arCanvas").style.display = "none"

  // Show a help message in the AR guide
  emit("statuschange", "findSurface")
}

function onSessionEnded() {
  experience.webXR.hitTestSourceRequested = false
  experience.webXR.hitTestSource = null
  experience.webXR.indicator.reset()
  inAR.value = false

  // Reset AR elements
  modelWasPlaced = false
  arModelGroup.visible = true
  arModelGroup.position.set(0, 0, 0)

  // Make the canvas visible again
  // document.querySelector("#arCanvas").style.visibility = "initial"
  document.querySelector("#arCanvas").style.opacity = 1.0

  // Reset the camera to the starting position
  experience.camera.reset()

  // Hide the AR helper status again
  emit("statuschange", "hidden")
}

/* function that executes on webXR input source primary action */
function onXRSelect(event) {
  if (experience.webXR.indicator.isEnabled()) {
    if (!modelWasPlaced) {
      arModelGroup.visible = true

      let newPosition = new Vector3(0, 0, 0).setFromMatrixPosition(experience.webXR.indicator.mesh.matrix)

      // animate position if needed
      anime({
        targets: [arModelGroup.position],
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        easing: 'easeOutQuint',
        duration: 700,
      })

      arModelGroup.updateMatrixWorld()
      modelWasPlaced = true

      // Signal the AR guide that the artefact has been placed & suggest further actions
      emit("statuschange", "finished")
      experience.webXR.indicator.disable()
    }
  }
}

function onTouchStart(event) {
  console.log("onTouchStart")
}

function openInfocard(id) {
  infocardRef.value.open(id)
}

function closeInfocard() {
  let qPageContainer = document.querySelector(".q-page-container")
  qPageContainer.style.paddingBottom = "0px"
}

function startQuiz() {
  quiz.start()

  let firstQuestion = null

  for (let annotation of experience.annotationSystem.annotations) {

    // Only unlock the first annotation
    if (firstQuestion === null) {
      annotation.setQuestionIcon()
      firstQuestion = true
    } else {
      annotation.setLockIcon()
    }
  }
}

function resetQuiz() {
  quiz.reset()

  // Set the icons back to the original
  for (const annotation of experience.annotationSystem.annotations) {
    annotation.setIcon()
  }
}

function mergeAnnotationsAndQuiz(annotations, questions) {
  let merged = []
  let index = 0

  for (let annotation of annotations) {
    let entry = {}

    entry.index = index
    entry.id = annotation.id
    entry.icon = annotation.icon
    entry.annotation = annotation
    entry.question = questions.find(question => question.id === annotation.id)

    index++
    merged.push(entry)
  }

  return merged
}

function addEventListeners() {

  // Triggers a dialog after every answer
  quiz.addEventListener("showAnswer", (event) => {
    setTimeout(() => {
      $q.dialog({
        component: ConfirmationDialog,
        componentProps: {
          title: event.message.correct ? "Richtig!" : "Falsch",
          message: event.message.explanationText,
          color: event.message.correct ? "green-8" : "red-8",
          okText: "Weiter"
        }
      }).onDismiss(() => {
        quiz.finishQuiz()
      })
    }, 500)

    console.log(quiz.answeredQuestions)
    // TODO: Unlock the next icon in the 3d view
    for (let annotation of experience.annotationSystem.annotations) {
      if (annotation.annotationData.id > quiz.answeredQuestions) {
        annotation.setLockIcon()
      } else {
        let id = annotation.annotationData.id

        // find the right question
        let question = config.value.quiz.questions.find(question => question.id === id)
        console.log(question)

        if (question.answered != true) {
          annotation.setQuestionIcon()
          return
        }

        if (question.answeredCorrect === true) {
          annotation.setCorrectIcon()
        } else {
          annotation.setWrongIcon()
        }
      }
    }
  })

  // Triggers the result screen after answering every question
  quiz.addEventListener("finished", () => {
    setTimeout(() => {
      $q.dialog({
        component: QuizResultDialog,
        componentProps: {
          color: 'green-8',
          points: quiz.points
        }
      }).onOk(() => {
        setTimeout(() => {
          quizDialog.hide()

          resetQuiz()
        }, 200)
      })
    }, 650)
  })
}

</script>


<style>
/* Disable pull to refresh to stop the info sheet from reloading on swipe */
html,
body {
  overscroll-behavior: none;
}

#arScene {
  overflow: hidden;
}

#arCanvas {
  background-color: #87ceeb;
  display: block;
}
</style>
