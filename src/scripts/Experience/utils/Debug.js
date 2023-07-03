function createDebugOutline() {
  console.log('debug')
  const headElement = document.head
  const styleElement = document.createElement('style')
  styleElement.setAttribute('debug-css', '')
  const styleText = `* {
      outline: 1px dashed tomato;
      outline-offset: -1px;
    }`
  styleElement.innerText = styleText
  const debugElement = headElement.querySelector('[debug-css]')
  if (debugElement) {
    return debugElement.remove()
  }
  headElement.append(styleElement)
}

export { createDebugOutline }
