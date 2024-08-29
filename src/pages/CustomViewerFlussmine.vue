<template>
  <q-page id="three-scene">
    <loading-screen :show="showLoadingScreen" :progress="loadingProgress" :progress-label="progressLabel"
      :progress-description="progressDescription"></loading-screen>

    <info-card id="info-card" :config="config" ref="infocardRef" @closeInfocardEvent="closeInfocard" />

    <div id="annotations" style="z-index: 99;"></div>

    <q-page-sticky id="arMenu-container" position="top" :offset="[0, 24]" style="z-index: 99">
      <a-r-menu id="arMenu" :isRunning="isRunning" :hasQuiz="config.quiz != undefined" :animationReady="animationReady"
        :deviceSupportsAR="deviceSupportsAR" :arEnabled="config.ar" :animationIsPlaying="animationIsPlaying"
        :inAR="inAR" @onStartAR="startAR" @onToggleAnimation="toggleAnimation" @onShowQuizIntro="showQuizIntro">
      </a-r-menu>
    </q-page-sticky>

    <q-resize-observer @resize="resize" />

    <canvas id="three-canvas" />
  </q-page>
</template>

<script setup>
import { toRaw, onMounted, onUnmounted, ref } from 'vue'
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
//import { Inspector } from 'src/scripts/Experience/utils/Inspector'
//import { createDebugOutline, createDebugCube } from 'src/scripts/Experience/utils/Debug';

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

// XR
let deviceSupportsAR = ref(false)
let deviceSupportsARReason = ref(null)
let inAR = ref(false)
let currentXRSession = ref({})
let modelWasPlaced = false
let hitTestSourceRequested = ref(false)
let hitTestSource = ref(null)
let arModelGroup = new Group()
let mainModel

// Animations
let mixers = ref([])
let animationClips = ref([])

// Signal definitions
const emit = defineEmits(["statuschange"])

// ToDO:
// check if animation exists -> if not, hide animation button

onMounted(async () => {
  route = useRoute()

  /* Custom Route ID override */
  // For a new custom route, don't forget to put it in routes.js
  route.params.id = "flussmine"

  config.value = modelconfigs[route.params.id]
  annotationsAndQuiz = mergeAnnotationsAndQuiz(config.value.annotations, config.value.quiz.questions)

  arModelGroup.name = "arModelGroup"

  await createExperience()

  // Insert annotations into the scene
  for (let data of annotationsAndQuiz) {
    let annotation = experience.annotationSystem.createAnchoredAnnotation(toRaw(data.annotation), config.value.urlPath, mainModel)

    // TODO: Find better way to scale the annotation
    if (config.value.annotationScale) {
      annotation.target.scale.setScalar(config.value.annotationScale)
    }

    arModelGroup.attach(annotation.target)
    arModelGroup.attach(annotation.line)

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
          //console.log("locked")
        }
      }
    })
  }

  // Prepare quiz content
  quiz = new Quiz(toRaw(config.value.quiz))

  // Add other event listeners
  addEventListeners()

  //createDebugOutline()
})

onUnmounted(() => {
  experience.dispose()
})

async function createExperience() {
  experience = new Experience({
    initialCameraPosition: toRaw(config.value.initialCameraPosition)
  })

  // set orbit position
  if (config.value.initialOrbitTarget) {
    let target = config.value.initialOrbitTarget
    experience.controls.instance.target = new Vector3(target[0], target[1], target[2])
  }

  // Add the AR group to the scene
  experience.scene.add(arModelGroup)

  // Load the main model
  let mainModelUrl = `./models/${route.params.id}/${config.value.assets[0].url}`
  mainModel = await experience.resources.load(mainModelUrl)

  // Give a name
  mainModel.name = "mainModel"
  arModelGroup.attach(mainModel.scene)

  let mixer = experience.animationSystem.createMixer(mainModel.scene, "mainMixer")
  let actions = experience.animationSystem.createClips(mainModel.animations, mixer)

  // Load all the placeholder models if they exist
  for (let i = 1; i < config.value.assets.length; i++) {
    let entry = config.value.assets[i]

    if (!entry.replaces) {
      let url = `./models/${route.params.id}/${config.value.assets[i].url}`
      let model = await experience.resources.load(url)
      model.scene.name = config.value.assets[i].id
      arModelGroup.attach(model.scene)

      // Add animations if they exist
      if (model.animations.length > 0) {
        let mixer = experience.animationSystem.createMixer(model.scene, "mixer" + model.scene.name)
        let actions = experience.animationSystem.createClips(model.animations, mixer)
      }
    } else {
      let url = `./models/${route.params.id}/${config.value.assets[i].url}`
      let model = await experience.resources.load(url)
      model.scene.name = config.value.assets[i].id
      // Add animations if they exist
      if (model.animations.length > 0) {
        let mixer = experience.animationSystem.createMixer(model.scene, "mixer" + model.scene.name)
        let actions = experience.animationSystem.createClips(model.animations, mixer)
      }
      arModelGroup.attach(model.scene)
      let toReplace = arModelGroup.getObjectByName(config.value.assets[i].replaces)
      //console.log(toReplace);
      arModelGroup.remove(toReplace)
    }
  }

  showLoadingScreen.value = false


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

    // Make the model non-reactive as that is needed for the renderer to show the animation
    let gltfFile = toRaw(experience.resources.items["model"])

    //console.table(gltfFile.animations)

    // Add the model to the movable group
    // Do not add it to the scene but rather the arModelGroup
    arModelGroup.attach(gltfFile.scene)


    // Create the mixer for the mesh
    let mixer = experience.animationSystem.createMixer(gltfFile.scene, "mainMixer")
    //mixers.value.push(mixer)

    // Create the clip actions
    let actions = experience.animationSystem.createClips(gltfFile.animations, mixer)

    // Load additional 3d models if defined
    if (config.value.additionalModels) {
      for (let model of config.value.additionalModels) {
        let path = `./models/${route.params.id}/${model}`
        experience.resources.load(path)
      }
    }
    showLoadingScreen.value = false
  })

  // Is triggered for every 3d model loading after the first file
  experience.resources.on("modelReady", (gltfFile) => {
    // add the loaded model to the arModelGroup
    arModelGroup.attach(gltfFile.scene)

    // Create the mixer for the mesh
    let mixer = experience.animationSystem.createMixer(gltfFile.scene, "secondaryMixer")
    //mixers.value.push(mixer)

    // Create the clip actions
    let actions = experience.animationSystem.createClips(gltfFile.animations, mixer)
  })

  // ===== New WebXR =====

  // use the new system
  experience.webXRSystem.addEventListener("error", (err) => {
    console.log("error", err)
  })

  experience.webXRSystem.addEventListener("xrsupported", (event) => {
    deviceSupportsAR.value = event.message.isSupported
    if (event.message.reason) {
      deviceSupportsARReason.value = event.message.reason
    }
  })

  experience.webXRSystem.addEventListener("xrstarted", (event) => {
    onSessionStarted()
  })

  experience.webXRSystem.addEventListener("xrended", (event) => {
    console.log("Session Ended");
    onSessionEnded()
  })

  experience.webXRSystem.setXRSessionFeatures("immersive-ar", {
    requiredFeatures: ['hit-test', 'dom-overlay'],
    domOverlay: { root: document.body },
  })

  experience.webXRSystem.checkXRSupport()

  experience.renderer.instance.setAnimationLoop((timestamp, frame) => {
    update(timestamp, frame)
  })

  //inspector.buildSceneTree()
}

function rotateObject() {
  if (inAR.value) {
    arModelGroup.rotation.y += deltaX.value / 500
  }
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
    if (hitTestSourceRequested.value === false) {
      session.requestReferenceSpace("viewer").then(function (referenceSpace) {
        session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
          hitTestSource.value = source
        })
      })

      // The hit testing setup for the session is done
      hitTestSourceRequested.value = true
    }

    if (hitTestSource.value) {
      // Get the hits with the current source
      const hitTestResults = frame.getHitTestResults(hitTestSource.value)

      // If we have at least one hit
      if (hitTestResults.length) {

        // Get the first hit
        const hit = hitTestResults[0]

        // Show the indicator
        if (!experience.webXRSystem.xrIndicator.shownOnce) {
          experience.webXRSystem.xrIndicator.shownOnce = true
          experience.webXRSystem.xrIndicator.enable()

          //emit a signal to the AR guide that the artefact can be placed now
          emit('statuschange', 'placeInitial')
        } else {
          const pose = hit.getPose(referenceSpace).transform.matrix

          experience.webXRSystem.xrIndicator.mesh.matrix.fromArray(pose)
        }
      } else {
        // no hitTestResults, hide the indicator again
        experience.webXRSystem.xrIndicator.visible = false
      }
    }
  }

  // Framework update
  experience.timer.update()

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


  // Debug: Change the model animation
  /*if (mainModel) {
    console.log(mainModel.scene);
    mainModel.scene.position.x = Math.sin(timestamp * 0.0008) * 0.1
  }*/

  // Keep this last, render the final frame
  experience.renderer.update()
}

function toggleAnimation() {
  animationIsPlaying.value = !animationIsPlaying.value
  playAnimations(animationIsPlaying.value)
}

function playAnimations(enabled) {
  for (let animationClip of experience.animationSystem.animationClips) {

    if (enabled) {
      animationClip.action.paused = false
      animationClip.action.play()
      experience.annotationSystem.hideAnnotations(true)
    } else {
      animationClip.action.paused = true
      experience.annotationSystem.hideAnnotations(false)
    }
  }
}

function startAR() {
  if (deviceSupportsAR.value === true) {
    experience.webXRSystem.startXR()
  } else {
    $q.dialog({
      component: ErrorDialog,
      componentProps: {
        errorTitle: "AR nicht unterstützt",
        errorDescription: "Die AR-Funktion ist für dieses Gerät leider nicht verfügbar.",
        errorMessage: deviceSupportsARReason.value
      }
    })
  }
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

async function onSessionStarted() {
  // Should be handled by webxr and actually is already
  currentXRSession.value = experience.webXRSystem.xrSession
  inAR.value = true

  // Hide the group that shall be placeable
  arModelGroup.visible = false

  // Setting up the fade in from the bottom
  arModelGroup.position.y = -5

  experience.webXRSystem.xrSession.addEventListener("select", onXRSelect)

  // Set the referenceSpaceType for the session (yes, session)
  experience.renderer.instance.xr.setReferenceSpaceType('local')

  // Instead change the opacity of the canvas to still receive pointer events
  document.querySelector("#three-canvas").style.opacity = 0

  // Show a help message in the AR guide
  emit("statuschange", "findSurface")
}

function onSessionEnded() {

  hitTestSourceRequested.value = false
  hitTestSource.value = null
  experience.webXRSystem.xrIndicator.reset()
  inAR.value = false

  // Reset AR elements
  modelWasPlaced = false
  arModelGroup.visible = true
  // Todo: Check if every child should be positioned manually, as the lines do not seeem to move correctly
  arModelGroup.position.set(0, 0, 0)

  // Make the canvas visible again
  document.querySelector("#three-canvas").style.opacity = 1.0

  // Reset the camera to the starting position
  experience.camera.reset()

  // Hide the AR helper status again
  emit("statuschange", "hidden")
  console.log("onSessionEnded")
}

/* function that executes on webXR input source primary action */
function onXRSelect(event) {
  if (experience.webXRSystem.xrIndicator.isEnabled()) {
    if (!modelWasPlaced) {
      arModelGroup.visible = true

      let newPosition = new Vector3(0, 0, 0).setFromMatrixPosition(experience.webXRSystem.xrIndicator.mesh.matrix)

      anime({
        targets: [arModelGroup.position],
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        easing: 'easeOutQuint',
        duration: 700,
      })

      modelWasPlaced = true

      // Signal the AR guide that the artefact has been placed & suggest further actions
      emit("statuschange", "finished")

      // Hide the xrIndicator
      experience.webXRSystem.xrIndicator.disable()
    }
  }
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

  // This changes the "Quiz" button to show a closing "X"
  isRunning.value = true

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

  // This shows the "quiz" icon again
  isRunning.value = false

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

    //console.log(quiz.answeredQuestions)
    // TODO: Unlock the next icon in the 3d view
    for (let annotation of experience.annotationSystem.annotations) {
      if (annotation.annotationData.id > quiz.answeredQuestions) {
        annotation.setLockIcon()
      } else {
        let id = annotation.annotationData.id

        // find the right question
        let question = config.value.quiz.questions.find(question => question.id === id)
        //console.log(question)

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

#three-scene {
  overflow: hidden;
}

#three-canvas {
  background-color: #87ceeb;
  display: block;
}
</style>
