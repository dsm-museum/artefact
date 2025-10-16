<template>
  <q-page id="three-page">
    <loading-screen :show="showLoadingScreen" :progress="loadingProgress" :progress-label="progressLabel"
      :progress-description="progressDescription"></loading-screen>

    <info-card id="info-card" :config="config" ref="infocardRef" @closeInfocardEvent="closeInfocard" />

    <div id="annotations" style="z-index: 99"></div>

    <q-page-sticky id="arMenu-container" position="top" :offset="[0, 24]" style="z-index: 99">
      <a-r-menu id="arMenu" :isRunning="isRunning" :hasAnimation="hasAnimation" :hasQuiz="config.quiz != undefined"
        :animationReady="animationReady" :deviceSupportsAR="deviceSupportsAR" :arEnabled="config.ar"
        :animationIsPlaying="animationIsPlaying" :inAR="inAR" @onStartAR="startAR" @onToggleAnimation="toggleAnimation"
        @onShowQuizIntro="showQuizIntro">
      </a-r-menu>
    </q-page-sticky>

    <q-resize-observer @resize="resize" />

    <canvas id="three-canvas" role="img" />
  </q-page>
</template>

<script setup>
import { toRaw, onMounted, onUnmounted, ref } from 'vue'
import anime from 'animejs/lib/anime.es'
import { useQuasar } from 'quasar'
import { Group, LoopPingPong, LoopRepeat, Vector3 } from 'three'

/* Own Imports */
import Experience from 'src/scripts/Experience/Experience'
import LoadingScreen from 'src/components/LoadingScreen.vue'
import InfoCard from 'src/components/InfoCard.vue'
import ARMenu from 'src/components/ARMenu.vue'
import ErrorDialog from 'src/components/dialogs/ErrorDialog.vue'
import ConfirmationDialog from 'src/components/dialogs/ConfirmationDialog.vue'
import OKCancelDialog from 'src/components/dialogs/OKCancelDialog.vue'
import QuizCardDialog from 'src/components/dialogs/QuizCardDialog.vue'
import Quiz from 'src/scripts/Quiz/Quiz'
import QuizResultDialog from 'src/components/dialogs/QuizResultDialog.vue'
import appConfig from "src/config.json"

const props = defineProps({
  modelId: {
    type: String,
    required: true
  }
})

// Config
let config = {}
let experience
const $q = useQuasar()

// Animation
// FIXME: Change animationReady false if no animation is found or loading the animation didn't work
let animationReady = ref(true)
let hasAnimation = ref(true)
let animationIsPlaying = ref(false)

// Loading progress
let showLoadingScreen = ref(true)
let loadingProgress = ref(0)
let progressLabel = ref('0')
let progressDescription = ref('')

// Infocard
let infocardRef = ref(null)

// Quiz
let quiz
let quizDialog
let isRunning = ref(false)
let annotationsAndQuiz = ref([])

// XR
let deviceSupportsAR = ref(false)
let deviceSupportsARReason = ref(null)
let inAR = ref(false)
let modelWasPlaced = false
let hitTestSourceRequested = ref(false)
let hitTestSource = ref(null)
let previousX = ref(0)
let previousY = ref(0)
let isDragging = ref(false)

// Grouping
let sceneContents = new Group() // Holds all the contents, as we want to avoid moving the origin (origin = experience.scene.position)
sceneContents.name = 'sceneContents'
let mainModel = null

// Signal definitions
const emit = defineEmits(['statuschange'])

// Start of the page
onMounted(async () => {
  config = appConfig[props.modelId]

  //TODO: Put all config related stuff together
  if (config.backgroundColor) {
    document.querySelector("#three-canvas").style.backgroundColor = config.backgroundColor
  }

  // FIXME: This function does too much. I'd rather split it
  await createExperience()

  // TODO: Integrate loading and aborting 3d model load with the AbortController, see https://github.com/mrdoob/three.js/pull/31276
  // Add annotation and quiz content to the scene if it exists
  if (mainModel) {
    let index = 0
    // For every annotation hotspot (that optionally has a quiz)...
    for (let data of config.content) {
      let annotation = experience.annotationSystem.createAnchoredAnnotation(data, props.modelId, mainModel)
      data.index = index

      if (config.annotationScale) {
        annotation.target.scale.setScalar(config.annotationScale)
      }

      sceneContents.add(annotation.target)
      sceneContents.add(annotation.line)

      experience.click(annotation.target, () => {
        if (!quiz.isRunning) {
          openInfocard(data.id)
        } else {
          if (data.index <= quiz.answeredQuestions) {
            quizDialog = $q.dialog({
              component: QuizCardDialog,
              componentProps: {
                quiz: quiz,
                data: data,
                config: config.content,
                urlPath: config.url,
                tab: data.id,
              },
            })
          } else {
            //console.log("locked")
          }
        }
      })

      index++
    }

  }

  // Prepare quiz content
  if (config.content[0].quiz) {
    quiz = new Quiz(config)
  }

  // Add other event listeners
  addEventListeners()
})

// Destructor, triggered on page navigation
onUnmounted(() => {
  experience.dispose()
})

// FIXME: This function does too much
async function createExperience() {
  experience = new Experience({
    cameraPosition: toRaw(config.cameraPosition)
  })

  // set orbit position
  if (config.origin) {
    let target = config.origin
    experience.controls.instance.target = new Vector3(
      target.x,
      target.y,
      target.z
    )
  }

  // Add the contents to the scene
  // sceneContents.position.y = 0.08
  // sceneContents.position.z = -0.07
  experience.scene.add(sceneContents)

  // --- RESOURCE LOADING ---
  experience.resources.setup(config.assets)

  /*experience.resources.on("finishedSingle", (loaded, total, overallProgress) => {
    //console.log("finishedSingle", loaded, total, overallProgress)
    //loadingProgress.value = loaded / total
    //progressLabel.value = overallProgress
  })*/

  experience.resources.on("finishedAll", (nrOfAssets, overallProgress) => {
    //console.log("finishedAll", nrOfAssets)
    loadingProgress.value = 100
    progressLabel.value = 100 + '%'

    //console.log(experience.animationSystem.animationClips.length)
    if (experience.animationSystem.animationClips == 0 || experience.animationSystem.animationClips.length == 0) {
      hasAnimation.value = false
    }

    setTimeout(() => {
      showLoadingScreen.value = false
    }, 500)
  })

  experience.resources.on("progress", (percentage) => {
    //console.log("percentage", percentage)
    loadingProgress.value = percentage
    progressLabel.value = percentage + '%'
  })

  // Loading flow:
  // - Some assets need to be there, before the scene can be shown
  // - The other ones will be handled in config.additionalModels and are not handled in the BaseViewer for now
  // - we need to sort for assets, where the "replaces" property is null
  // Load the main model
  //const mainModelUrl = () => import(`./models/${props.modelId}/${config.assets[0].url}`);
  let mainModelUrl = `./models/${props.modelId}/${config.assets[0].url}`
  try {
    mainModel = await experience.resources.load(mainModelUrl)

    mainModel.name = 'mainModel'
    console.log(mainModel)
    sceneContents.add(mainModel.scene)
    experience.resources.trigger("loaded", { mainModel })

    let mixer = experience.animationSystem.createMixer(
      mainModel.scene,
      'mainMixer'
    )
    let actions = experience.animationSystem.createClips(
      mainModel.animations,
      mixer
    )

    if (actions.length >= 1) {
      hasAnimation.value = true
    }

    // TODO: Check if this is the right place to trigger "loaded"
  } catch {
    console.error(
      `No model was found. Stopping Animation and Annotation loading.`
    )

    $q.dialog({
      component: ErrorDialog,
      persistent: true,
      componentProps: {
        errorTitle: '3D-Modell nicht gefunden',
        errorDescription: 'Leider konnte das 3D-Modell nicht geladen werden.',
        errorMessage: null,
        persistent: true,
      },
    })

    mainModel = null

    progressLabel.value = ':('

    return
  }

  // Load all other models if they exist (note the `let i = 1` instead of `0`)
  for (let i = 1; i < config.assets.length; i++) {
    let entry = config.assets[i]

    let url = `./models/${props.modelId}/${config.assets[i].url}`
    let model = await experience.resources.load(url)
    model.scene.name = config.assets[i].id

    // Register animations if they exist
    if (model.animations.length > 0) {
      let mixer = experience.animationSystem.createMixer(
        model.scene,
        'mixer' + model.scene.name
      )
      let actions = experience.animationSystem.createClips(
        model.animations,
        mixer
      )
    }

    // If the asset shall replace something
    if (entry.replaces) {
      sceneContents.add(model.scene)
      let toReplace = experience.scene.getObjectByName(
        config.assets[i].replaces
      )
      sceneContents.remove(toReplace)
    } else {
      sceneContents.add(model.scene)
    }

    if (experience.animationSystem.animationClips.length >= 1) {
      hasAnimation.value = true
    }
  }

  // Connect the resize event for correct resizing of the scene
  experience.resizer.on('resize', () => {
    resize()
  })

  experience.webXRSystem.addEventListener('error', (err) => {
    console.log('error', err)
  })

  experience.webXRSystem.addEventListener('xrsupported', (event) => {
    deviceSupportsAR.value = event.message.isSupported
    if (event.message.reason) {
      deviceSupportsARReason.value = event.message.reason
    }
  })

  experience.webXRSystem.addEventListener('xrstarted', () => {
    onSessionStarted()
  })

  experience.webXRSystem.addEventListener('xrended', () => {
    console.log('Session Ended')
    onSessionEnded()
  })

  experience.webXRSystem.setXRSessionFeatures('immersive-ar', {
    requiredFeatures: ['hit-test', 'dom-overlay'],
    domOverlay: { root: document.body },
  })

  // FIXME: Maybe put this to the top? OR inside of the experience class
  experience.webXRSystem.checkXRSupport()

  experience.renderer.instance.setAnimationLoop((timestamp, frame) => {
    update(timestamp, frame)
  })

  // Set up the initial touch point when the user first touches the screen
  experience.canvas.addEventListener('pointerdown', (event) => {
    if (experience.renderer.instance.xr.isPresenting) {
      previousX.value = event.screenX;
      previousY.value = event.screenY;
      isDragging.value = true;
    }
  });

  // Stop rotating when the user lifts their finger
  experience.canvas.addEventListener('pointerup', () => {
    isDragging.value = false;
  });

  // This event listener enables rotation in AR mode
  experience.canvas.addEventListener('pointermove', (event) => {
    // Only rotate the object in AR mode
    if (experience.renderer.instance.xr.isPresenting) {
      let delta = {
        x: event.screenX - previousX.value,
        y: event.screenY - previousY.value,
      }

      sceneContents.rotation.y += delta.x * 0.009

      previousX.value = event.screenX
      previousY.value = event.screenY
    }
  })
}

// FIXME: could be removed, as it only touches the experience itself
function resize() {
  if (experience) {
    experience.camera.resize()
    experience.renderer.resize()
  }
}

// Put the webxr logic inside the experience class
function update(timestamp, frame) {
  experience.dispatchEvent({ type: "beforeUpdate", message: animationIsPlaying.value })
  // XR update
  if (frame) {
    const referenceSpace = experience.renderer.instance.xr.getReferenceSpace()
    const session = experience.renderer.instance.xr.getSession()

    // Request a hit test setup once
    if (hitTestSourceRequested.value === false) {
      session.requestReferenceSpace('viewer').then(function (referenceSpace) {
        session
          .requestHitTestSource({ space: referenceSpace })
          .then(function (source) {
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

  // Timer update for animations
  experience.timer.update()

  // Update the annotationSystem and their annotations
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
  playAnimations(animationIsPlaying.value)
  experience.dispatchEvent({ type: "animationState", message: animationIsPlaying.value })
}

function playAnimations(enabled) {
  for (let animationClip of experience.animationSystem.animationClips) {
    animationClip.action.loop = animationClip.loop

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
        errorTitle: 'AR nicht unterstützt',
        errorDescription:
          'Die AR-Funktion ist für dieses Gerät leider nicht verfügbar.',
        errorMessage: deviceSupportsARReason.value,
      },
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
        title: 'Quiz starten',
        message:
          'Kleiner Tipp: Es lohnt sich bevor du mit dem Quiz beginnst, die Texte gut zu kennen, denn dort verstecken sich wichtige Infos!',
        okText: 'Quiz starten',
        color: 'primary',
      },
    }).onOk(() => {
      // Stop the animation from playing and start the quiz
      animationIsPlaying.value = false
      playAnimations(false)
      startQuiz()
    })
  } else {
    // Show the cancel dialog
    $q.dialog({
      component: OKCancelDialog,
      componentProps: {
        title: 'Quiz beenden',
        message:
          'Willst du das Quiz wirklich beenden? Bitte beachte, dass dann dein Fortschritt verloren geht und du von vorne anfangen musst.',
        okText: 'Ja',
      },
    }).onOk(() => {
      resetQuiz()
    })
  }
}

async function onSessionStarted() {
  inAR.value = true

  // Hide the group that shall be placeable
  sceneContents.position.y = -2
  sceneContents.scale.set(0, 0, 0)
  sceneContents.visible = false

  experience.webXRSystem.xrSession.addEventListener('select', onXRSelect)

  // Set the referenceSpaceType for the session (yes, session)
  experience.renderer.instance.xr.setReferenceSpaceType('local')

  // Instead change the opacity of the canvas to still receive pointer events
  document.querySelector('#three-canvas').style.opacity = 0

  // Show a help message in the AR guide
  emit('statuschange', 'findSurface')
}

function onSessionEnded() {
  hitTestSourceRequested.value = false
  hitTestSource.value = null
  experience.webXRSystem.xrIndicator.reset()
  inAR.value = false

  // Reset AR elements
  modelWasPlaced = false
  sceneContents.visible = true
  sceneContents.position.set(0, 0, 0)

  // Make the canvas visible again
  // document.querySelector("#three-canvas").style.visibility = "initial"
  document.querySelector('#three-canvas').style.opacity = 1.0

  // Reset the camera to the starting position
  experience.camera.reset()

  // Hide the AR helper status again
  emit('statuschange', 'hidden')
}

/* Function that executes on WebXR input source primary action */
function onXRSelect() {
  if (experience.webXRSystem.xrIndicator.isEnabled()) {
    if (!modelWasPlaced) {
      sceneContents.visible = true

      let newPosition = new Vector3(0, 0, 0).setFromMatrixPosition(
        experience.webXRSystem.xrIndicator.mesh.matrix
      )

      anime({
        targets: [sceneContents.position],
        x: newPosition.x,
        y: newPosition.y,
        z: newPosition.z,
        easing: 'easeOutQuint',
        duration: 700,
      })

      anime({
        targets: [sceneContents.scale],
        x: 1.0,
        y: 1.0,
        z: 1.0,
        easing: 'easeOutExpo',
        duration: 500,
        delay: 150
      })

      modelWasPlaced = true

      // Signal the AR guide that the artefact has been placed & suggest further actions
      // FIXME: Pull the AR guide inside the BaseViewer.vue
      emit('statuschange', 'finished')

      // Hide the xrIndicator
      experience.webXRSystem.xrIndicator.disable()
    }
  }
}

function openInfocard(id) {
  infocardRef.value.open(id)
}

function closeInfocard() {
  let qPageContainer = document.querySelector('.q-page-container')
  qPageContainer.style.paddingBottom = '0px'
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

// FIXME: Separate this so it can be extended from
function addEventListeners() {
  // Triggers a dialog after every answer
  // FIXME: turn into event "onAnsweredQuestion" or something
  quiz.addEventListener('showAnswer', (event) => {
    setTimeout(() => {
      $q.dialog({
        component: ConfirmationDialog,
        componentProps: {
          title: event.message.correct ? 'Richtig!' : 'Falsch',
          message: event.message.explanationText,
          color: event.message.correct ? 'green-8' : 'red-8',
          okText: 'Weiter',
        },
      }).onDismiss(() => {
        quiz.finishQuiz()
      })
    }, 500)

    for (let annotation of experience.annotationSystem.annotations) {
      if (annotation.annotationData.id > quiz.answeredQuestions) {
        annotation.setLockIcon()
      } else {
        let id = annotation.annotationData.id

        // find the right question
        let annotationContent = config.content.find((contentElem) => {
          if (contentElem.id === id) {
            return contentElem
          }
        })

        console.log(annotationContent);

        if (annotationContent.quiz.answered != true) {
          annotation.setQuestionIcon()
          return
        }

        if (annotationContent.quiz.answeredCorrect === true) {
          annotation.setCorrectIcon()
        } else {
          annotation.setWrongIcon()
        }
      }
    }
  })

  // Triggers the result screen after answering every question
  // FIXME: rename to "onFinished"
  quiz.addEventListener('finished', () => {
    setTimeout(() => {
      $q.dialog({
        component: QuizResultDialog,
        componentProps: {
          color: 'green-8',
          points: quiz.points,
        },
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

#three-page {
  overflow: hidden;
}

#three-canvas {
  background-color: #87ceeb;
  display: block;
}
</style>
