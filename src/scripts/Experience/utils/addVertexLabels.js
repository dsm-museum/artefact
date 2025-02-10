import { Sprite, SpriteMaterial, Vector3, CanvasTexture } from 'three'

/**
 * Adds 3D labels to all vertices of a mesh.
 * @param {THREE.Mesh} mesh - The mesh whose vertices should be labeled.
 * @param {THREE.Scene} scene - The scene to which the labels will be added.
 * @param {Object} options - Customization options for the labels.
 * @param {string} options.color - The text color for the labels (default: 'black').
 * @param {string} options.backgroundColor - The background color for the labels (default: 'white').
 * @param {number} options.size - The font size for the labels (default: 20).
 */
export function addVertexLabels(mesh, scene, options = {}) {
  const { color = 'black', backgroundColor = 'white', size = 20 } = options

  // Ensure the mesh has geometry
  if (!mesh.geometry) {
    console.warn('Mesh does not have geometry')
    return
  }

  const vertices = mesh.geometry.attributes.position
  const labels = []

  for (let i = 0; i < vertices.count; i = i + 5) {
    const vertex = new Vector3()
    vertex.fromBufferAttribute(vertices, i)
    vertex.applyMatrix4(mesh.matrixWorld) // Transform vertex to world space

    // Create a canvas for the label
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const text = `V${i}`
    context.font = `${size}px Arial`
    const textWidth = context.measureText(text).width

    canvas.width = textWidth + 10
    canvas.height = size + 10

    // Draw label background and text
    context.fillStyle = backgroundColor
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = color
    context.fillText(text, 5, size)

    // Create a texture and sprite material from the canvas
    const texture = new CanvasTexture(canvas)
    const material = new SpriteMaterial({ map: texture, depthTest: false })
    const sprite = new Sprite(material)

    // Position the sprite at the vertex
    sprite.position.copy(vertex)
    sprite.scale.set(0.01, 0.01, 0.01) // Adjust scale as needed
    scene.add(sprite)
    labels.push(sprite)
  }

  return labels // Return the array of labels for further management if needed
}
