<template>
    <q-page id="three-page">
        <h1>Hello World</h1>
    </q-page>
</template>

<script setup>
import { onMounted } from "vue"

// defineEmits returns a function that can emit events
// Usage: emit('eventname')
const emit = defineEmits([''])

// define exposed functions here
defineExpose({
    createViewer
})

onMounted(() => {
    console.log("BaseViewer mounted")
})

function createViewer() {
    console.log("creating BaseViewer...")
}
</script>